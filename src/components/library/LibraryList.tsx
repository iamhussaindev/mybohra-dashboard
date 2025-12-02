import Table from '@components/ui/atoms/Table'
import { useDebounce } from '@hooks/useDebounce'
import { LibraryService } from '@lib/api/library'
import { StorageService } from '@lib/api/storage'
import { IconBrandYoutube, IconCloudUpload, IconFileText, IconFilter, IconMoodSmile, IconPlayerPause, IconPlayerPlay, IconPlus, IconRefresh, IconTrash, IconUpload } from '@tabler/icons-react'
import { AlbumEnum, Library, LibraryFilters } from '@type/library'
import { Button, Input, message, Popconfirm, Select } from 'antd'
import { useEffect, useMemo, useState } from 'react'

const TAG_PILL_THEMES = [
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
]

interface LibraryListProps {
  onDeleteLibrary?: (id: number) => void
  onViewMiqaats?: (library: Library) => void
  onCreateLibrary?: () => void
  searchQuery?: string
}

const LibraryList = ({ onDeleteLibrary, onViewMiqaats, onCreateLibrary, searchQuery = '' }: LibraryListProps) => {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(false)
  const [filters] = useState<LibraryFilters>({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 500,
    total: 0,
  })
  const [hasNextPage, setHasNextPage] = useState(true)
  const [audioStates, setAudioStates] = useState<Record<number, { playing: boolean; error: boolean }>>({})
  const [dragStates, setDragStates] = useState<Record<number, { isDragOver: boolean; dragCounter: number }>>({})
  const [selectedItem, setSelectedItem] = useState<Library | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Partial<Library>>({})
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([])
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<string[]>([])

  // Helper function to parse tags/categories
  const parseTagsOrCategories = (value: string[] | string | undefined): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean)
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
    }
    return []
  }

  // Helper function to get unique tags from current libraries
  const getUniqueTags = () => {
    const allTags = libraries.flatMap(lib => parseTagsOrCategories(lib.tags))
    return Array.from(new Set(allTags)).sort()
  }

  // Helper function to get unique categories from current libraries
  const getUniqueCategories = () => {
    const allCategories = libraries.flatMap(lib => parseTagsOrCategories(lib.categories))
    return Array.from(new Set(allCategories)).sort()
  }

  const filteredLibraries = useMemo(() => {
    if (!activeTagFilters.length && !activeCategoryFilters.length) return libraries

    return libraries.filter(lib => {
      const tags = parseTagsOrCategories(lib.tags)
      const categories = parseTagsOrCategories(lib.categories)
      const matchesTags = activeTagFilters.every(tag => tags.includes(tag))
      const matchesCategories = activeCategoryFilters.every(category => categories.includes(category))
      return matchesTags && matchesCategories
    })
  }, [libraries, activeTagFilters, activeCategoryFilters])

  const renderTagPills = (items: string[], limit = 3, offset = 0) => {
    if (!items.length) return <span className="text-xs text-gray-400">-</span>

    const visible = items.slice(0, limit)
    const extra = items.length - limit

    return (
      <div className="flex flex-wrap gap-1">
        {visible.map((item, index) => {
          const theme = TAG_PILL_THEMES[(index + offset) % TAG_PILL_THEMES.length]
          return (
            <span
              key={`${item}-${index}`}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${theme.bg} ${theme.border} ${theme.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
              {item}
            </span>
          )
        })}
        {extra > 0 && (
          <span className="inline-flex items-center rounded-full border border-dashed border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">+{extra}</span>
        )}
      </div>
    )
  }

  const renderFilterChip = (label: string, value: string, type: 'tag' | 'category', index: number) => {
    const theme = TAG_PILL_THEMES[index % TAG_PILL_THEMES.length]
    const isActive = type === 'tag' ? activeTagFilters.includes(value) : activeCategoryFilters.includes(value)
    return (
      <span
        key={`${label}-${index}`}
        onClick={() => toggleQuickFilter(type, value)}
        className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold text-left transition hover:-translate-y-0.5 ${
          isActive ? `${theme.bg} ${theme.border} ${theme.text} shadow-sm` : 'bg-white border-slate-200 text-slate-600'
        }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
        {label}
        {isActive && <span className="text-xs text-slate-400">✕</span>}
      </span>
    )
  }

  const toggleQuickFilter = (type: 'tag' | 'category', value: string) => {
    if (type === 'tag') {
      setActiveTagFilters(prev => (prev.includes(value) ? prev.filter(tag => tag !== value) : [...prev, value]))
    } else {
      setActiveCategoryFilters(prev => (prev.includes(value) ? prev.filter(category => category !== value) : [...prev, value]))
    }
  }

  const clearQuickFilters = () => {
    setActiveTagFilters([])
    setActiveCategoryFilters([])
  }

  const hasActiveQuickFilters = activeTagFilters.length > 0 || activeCategoryFilters.length > 0

  const totalItems = pagination.total || libraries.length
  const audioAvailable = useMemo(() => libraries.filter(library => Boolean(library.audio_url)).length, [libraries])
  const pdfAvailable = useMemo(() => libraries.filter(library => Boolean(library.pdf_url)).length, [libraries])
  const uniqueAlbums = useMemo(() => Array.from(new Set(libraries.map(library => library.album).filter(Boolean))), [libraries])
  const highlightedTags = useMemo(() => getUniqueTags().slice(0, 6), [libraries])
  const highlightedCategories = useMemo(() => getUniqueCategories().slice(0, 6), [libraries])
  const quickStats = useMemo(
    () => [
      { label: 'Total Entries', value: totalItems, accent: 'from-indigo-500 to-violet-500' },
      { label: 'Audio Ready', value: audioAvailable, accent: 'from-blue-500 to-cyan-500' },
      { label: 'PDF Ready', value: pdfAvailable, accent: 'from-rose-500 to-orange-400' },
      { label: 'Albums', value: uniqueAlbums.length, accent: 'from-emerald-500 to-lime-400' },
    ],
    [audioAvailable, pdfAvailable, totalItems, uniqueAlbums.length]
  )

  // Debounce the search query by 500ms
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const checkFileExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  const saveErrorToLocalStorage = (libraryId: number, libraryName: string, errorType: 'audio_not_found' | 'playback_error') => {
    try {
      const errors = JSON.parse(localStorage.getItem('library_errors') || '[]')
      const errorEntry = {
        id: libraryId,
        name: libraryName,
        errorType,
        timestamp: new Date().toISOString(),
        url: errorType === 'audio_not_found' ? 'audio' : 'playback',
      }

      // Remove any existing errors for this library and error type
      const filteredErrors = errors.filter((error: any) => !(error.id === libraryId && error.errorType === errorType))

      filteredErrors.push(errorEntry)
      localStorage.setItem('library_errors', JSON.stringify(filteredErrors))
    } catch (error) {
      console.error('Failed to save error to localStorage:', error)
    }
  }

  const getErrorsFromLocalStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('library_errors') || '[]')
    } catch {
      return []
    }
  }

  const clearOldErrors = () => {
    try {
      const errors = getErrorsFromLocalStorage()
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const recentErrors = errors.filter((error: any) => new Date(error.timestamp) > oneWeekAgo)

      localStorage.setItem('library_errors', JSON.stringify(recentErrors))
    } catch (error) {
      console.error('Failed to clear old errors:', error)
    }
  }

  // Function to display all stored errors (useful for debugging)
  const displayStoredErrors = () => {
    const errors = getErrorsFromLocalStorage()
    if (errors.length === 0) {
      message.info('No audio errors stored in localStorage')
      return
    }

    console.log('Stored audio errors:', errors)
    message.info(`Found ${errors.length} stored audio error(s). Check console for details.`)
  }

  // Make functions available globally for debugging (remove in production)
  if (typeof window !== 'undefined') {
    ;(window as any).getLibraryErrors = getErrorsFromLocalStorage
    ;(window as any).clearLibraryErrors = () => {
      localStorage.removeItem('library_errors')
      message.success('All stored errors cleared')
    }
    ;(window as any).displayLibraryErrors = displayStoredErrors
  }

  const detectFileType = (file: File): 'audio' | 'pdf' | null => {
    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()

    // Check for audio files
    if (
      fileType.startsWith('audio/') ||
      fileName.endsWith('.mp3') ||
      fileName.endsWith('.wav') ||
      fileName.endsWith('.m4a') ||
      fileName.endsWith('.aac') ||
      fileName.endsWith('.ogg') ||
      fileName.endsWith('.flac') ||
      fileName.endsWith('.wma')
    ) {
      return 'audio'
    }

    // Check for PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'pdf'
    }

    return null
  }

  const handleFileUpload = async (file: File, type: 'audio' | 'pdf', library: Library) => {
    try {
      const result = await StorageService.uploadFile(file, type, library.name)

      if (result.success && result.url) {
        const updates = type === 'audio' ? { audio_url: result.url } : { pdf_url: result.url }

        await LibraryService.update(library.id, updates)
        message.success(`${type.toUpperCase()} uploaded successfully`)
        // Refresh the libraries list
        loadLibraries(pagination.current, debouncedSearchQuery, filters)
      } else {
        message.error(result.error || 'Upload failed')
      }
    } catch (error) {
      message.error('Upload failed')
      console.error('Upload error:', error)
    }
  }

  const handleFileDrop = (library: Library, file: File) => {
    const fileType = detectFileType(file)

    if (fileType) {
      handleFileUpload(file, fileType, library)
    } else {
      message.error('Please drop an audio file (.mp3, .wav, .m4a, etc.) or PDF file (.pdf)')
    }
  }

  const handleItemSelect = (item: Library) => {
    console.log('handleItemSelect called with item:', item.id)
    setSelectedItem(item)
    setEditingItem({ ...item })
    setSidebarVisible(true)
    console.log('sidebarVisible set to true')
  }

  const handleSidebarClose = () => {
    console.log('handleSidebarClose')
    setSidebarVisible(false)
    setSelectedItem(null)
    setEditingItem({})
  }

  const handleSaveChanges = async () => {
    if (!selectedItem) return

    try {
      await LibraryService.update(selectedItem.id, {
        name: editingItem.name,
        description: editingItem.description,
        album: editingItem.album,
        audio_url: editingItem.audio_url,
        pdf_url: editingItem.pdf_url,
        youtube_url: editingItem.youtube_url,
        tags: editingItem.tags,
        categories: editingItem.categories,
        metadata: editingItem.metadata,
      })
      message.success('Item updated successfully')
      loadLibraries(pagination.current, debouncedSearchQuery, filters)
      setSelectedItem({ ...selectedItem, ...editingItem })
    } catch (error) {
      message.error('Failed to update item')
      console.error('Update error:', error)
    }
  }

  const handleDragEnter = (libraryId: number, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragStates(prev => {
      const currentState = prev[libraryId] || { isDragOver: false, dragCounter: 0 }
      const newCounter = currentState.dragCounter + 1

      return {
        ...prev,
        [libraryId]: {
          isDragOver: e.dataTransfer.items && e.dataTransfer.items.length > 0,
          dragCounter: newCounter,
        },
      }
    })
  }

  const handleDragLeave = (libraryId: number, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragStates(prev => {
      const currentState = prev[libraryId] || { isDragOver: false, dragCounter: 0 }
      const newCounter = currentState.dragCounter - 1

      return {
        ...prev,
        [libraryId]: {
          isDragOver: newCounter > 0,
          dragCounter: newCounter,
        },
      }
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (library: Library, e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDragStates(prev => ({
      ...prev,
      [library.id]: { isDragOver: false, dragCounter: 0 },
    }))

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      handleFileDrop(library, file)
    }
  }

  const toggleAudio = async (library: Library) => {
    const audioState = audioStates[library.id]
    const isPlaying = audioState?.playing || false

    if (isPlaying) {
      // Stop all audio
      setAudioStates(prev => ({ ...prev, [library.id]: { playing: false, error: false } }))
    } else {
      // Check if audio file exists before playing
      if (!library.audio_url) {
        message.error(`No audio file available for "${library.name}"`)
        saveErrorToLocalStorage(library.id, library.name, 'audio_not_found')
        return
      }

      const fileExists = await checkFileExists(library.audio_url)

      if (!fileExists) {
        message.error(`Audio file not found for "${library.name}". The file may have been deleted or moved.`)
        saveErrorToLocalStorage(library.id, library.name, 'audio_not_found')

        // Set error state
        setAudioStates(prev => ({ ...prev, [library.id]: { playing: false, error: true } }))
        return
      }

      // Stop all other audio and start this one
      const newStates: Record<number, { playing: boolean; error: boolean }> = {}
      libraries.forEach(lib => {
        newStates[lib.id] = { playing: false, error: false }
      })
      newStates[library.id] = { playing: true, error: false }
      setAudioStates(newStates)

      // Try to play the audio
      try {
        const audio = new Audio(library.audio_url)
        audio.onerror = () => {
          message.error(`Failed to play audio for "${library.name}". The file may be corrupted.`)
          saveErrorToLocalStorage(library.id, library.name, 'playback_error')
          setAudioStates(prev => ({ ...prev, [library.id]: { playing: false, error: true } }))
        }
        audio.onended = () => {
          setAudioStates(prev => ({ ...prev, [library.id]: { playing: false, error: false } }))
        }
        await audio.play()
      } catch (error) {
        message.error(`Failed to play audio for "${library.name}". ${error instanceof Error ? error.message : 'Unknown error'}`)
        saveErrorToLocalStorage(library.id, library.name, 'playback_error')
        setAudioStates(prev => ({ ...prev, [library.id]: { playing: false, error: true } }))
      }
    }
  }

  // Custom sorting function that sorts by number first, then alphabetically
  const sortLibrariesByName = (a: Library, b: Library) => {
    const getNumberFromName = (name: string) => {
      const match = name.match(/^(\d+)\.?\s*/)
      return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER
    }

    const aNumber = getNumberFromName(a.name)
    const bNumber = getNumberFromName(b.name)

    // If both have numbers, sort by number first
    if (aNumber !== Number.MAX_SAFE_INTEGER && bNumber !== Number.MAX_SAFE_INTEGER) {
      if (aNumber !== bNumber) {
        return aNumber - bNumber
      }
    }

    // If only one has a number, prioritize the one with number
    if (aNumber !== Number.MAX_SAFE_INTEGER && bNumber === Number.MAX_SAFE_INTEGER) {
      return -1
    }
    if (aNumber === Number.MAX_SAFE_INTEGER && bNumber !== Number.MAX_SAFE_INTEGER) {
      return 1
    }

    // If both have no numbers or same numbers, sort alphabetically
    return a.name.localeCompare(b.name)
  }

  const loadLibraries = async (page = 1, search = '', filterData: LibraryFilters = {}, append = false) => {
    try {
      setLoading(true)
      console.log('📚 Loading libraries:', { page, search, filterData, append })

      if (search) {
        const searchResults = await LibraryService.search(search, 50)
        // Search now returns full Library objects
        // Sort search results by name (number first, then alphabetically)
        const sortedSearchData = searchResults.sort(sortLibrariesByName)
        setLibraries(sortedSearchData)
        setPagination(prev => ({ ...prev, total: sortedSearchData.length }))
        setHasNextPage(false) // No more pages for search results
        console.log('🔍 Search results:', sortedSearchData.length)
      } else {
        const result = await LibraryService.getPaginated(page, pagination.pageSize, filterData)
        console.log('📊 Paginated result:', {
          dataLength: result.data.length,
          total: result.total,
          page,
          pageSize: pagination.pageSize,
        })

        if (append) {
          setLibraries(prev => {
            // Filter out duplicates by checking existing IDs
            const existingIds = new Set(prev.map(item => item.id))
            const newItems = result.data.filter(item => !existingIds.has(item.id))
            const combinedLibraries = [...prev, ...newItems]
            // Sort by name (number first, then alphabetically)
            const sortedLibraries = combinedLibraries.sort(sortLibrariesByName)
            console.log('➕ Appending data. New items:', newItems.length, 'Total items now:', sortedLibraries.length)
            return sortedLibraries
          })
        } else {
          // Sort the initial data by name (number first, then alphabetically)
          const sortedData = result.data.sort(sortLibrariesByName)
          setLibraries(sortedData)
          console.log('🔄 Replacing data. Total items:', sortedData.length)
        }

        setPagination(prev => ({ ...prev, total: result.total, current: page }))
        const hasMore = result.data.length === pagination.pageSize && page * pagination.pageSize < result.total
        setHasNextPage(hasMore)
        console.log('📄 Has next page:', hasMore)
      }
    } catch (error) {
      message.error('Failed to load libraries')
      console.error('Load libraries error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLibraries()
    clearOldErrors() // Clean up old errors on component mount
  }, [])

  useEffect(() => {
    loadLibraries(1, debouncedSearchQuery, filters)
  }, [debouncedSearchQuery])

  const refetch = async (paginate = false, reset = false) => {
    console.log('🔄 Refetch called:', { paginate, reset, hasNextPage, currentPage: pagination.current })

    if (reset) {
      setLibraries([])
      setPagination(prev => ({ ...prev, current: 1 }))
      setHasNextPage(true)
      await loadLibraries(1, debouncedSearchQuery, filters)
    } else if (paginate && hasNextPage) {
      const nextPage = pagination.current + 1
      console.log('📄 Loading next page:', nextPage)
      await loadLibraries(nextPage, debouncedSearchQuery, filters, true)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await LibraryService.delete(id)
      message.success('Library item deleted successfully')
      loadLibraries(pagination.current, debouncedSearchQuery, filters)
      onDeleteLibrary?.(id)
    } catch (error) {
      message.error('Failed to delete library item')
      console.error('Delete error:', error)
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 300,

      render: (text: string, record: Library) => {
        const dragState = dragStates[record.id] || { isDragOver: false, dragCounter: 0 }
        return (
          <div
            className={`transition-all duration-200 ${dragState.isDragOver ? 'bg-blue-50 border border-blue-300 rounded' : selectedItem?.id === record.id ? 'rounded' : 'hover:bg-gray-50 rounded'}`}
            onDragEnter={e => handleDragEnter(record.id, e)}
            onDragLeave={e => handleDragLeave(record.id, e)}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(record, e)}>
            <div className="font-regular text-gray-900 text-sm">{text}</div>
            {dragState.isDragOver && <div className="text-xs text-blue-600 mt-1">Drop files here</div>}
          </div>
        )
      },
    },
    {
      title: 'Album',
      dataIndex: 'album',
      width: 130,
      key: 'album',
      render: (album: AlbumEnum) => <div className="text-sm text-gray-700">{album || '-'}</div>,
      filters: Object.values(AlbumEnum).map(album => ({ text: album, value: album })),
      onFilter: (value: string, record: Library) => record.album === value,
    },
    {
      title: 'Audio',
      key: 'audio',
      width: 150,
      render: (record: Library) => {
        const audioState = audioStates[record.id]
        const isPlaying = audioState?.playing || false
        const hasError = audioState?.error || false

        if (!record.audio_url) {
          return <div className="text-xs text-gray-500">No audio</div>
        }

        return (
          <button
            className={`group flex w-[120px] items-center shadow-box gap-2 rounded-full border px-1 py-1 text-xs font-semibold transition ${
              hasError
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : isPlaying
                ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
            }`}
            onClick={e => {
              e.stopPropagation()
              toggleAudio(record)
            }}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${hasError ? 'bg-rose-500' : isPlaying ? 'bg-indigo-500' : 'bg-slate-400 group-hover:bg-indigo-500'}`}>
              {hasError ? '!' : isPlaying ? <IconPlayerPause className="h-3 w-3" stroke={2} /> : <IconPlayerPlay className="h-3 w-3" stroke={2} />}
            </span>
            <span>{hasError ? 'Error' : isPlaying ? 'Playing' : 'Play audio'}</span>
          </button>
        )
      },
      filters: [
        { text: 'Available', value: 'available' },
        { text: 'Not Available', value: 'not_available' },
      ],
      onFilter: (value: string, record: Library) => {
        return value === 'available' ? !!record.audio_url : !record.audio_url
      },
    },
    {
      title: 'PDF',
      key: 'pdf',
      width: 150,
      render: (record: Library) => {
        if (!record.pdf_url) {
          return <div className="text-xs text-gray-500">No PDF</div>
        }

        return (
          <a
            href={record.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-[120px] group flex items-center shadow-box gap-2 rounded-full border border-emerald-200 bg-white px-1 py-1 text-xs font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
              <IconFileText className="h-3.5 w-3.5" stroke={2} />
            </span>
            <span>Open PDF</span>
          </a>
        )
      },
      filters: [
        { text: 'Available', value: 'available' },
        { text: 'Not Available', value: 'not_available' },
      ],
      onFilter: (value: string, record: Library) => {
        return value === 'available' ? !!record.pdf_url : !record.pdf_url
      },
    },

    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[] | string) => {
        const tagArray = Array.isArray(tags)
          ? tags
          : tags
          ? tags
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean)
          : []

        return renderTagPills(tagArray)
      },
      filters: getUniqueTags().map(tag => ({ text: tag, value: tag })),
      onFilter: (value: string, record: Library) => {
        const tagArray = parseTagsOrCategories(record.tags)
        return tagArray.includes(value)
      },
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      key: 'categories',
      width: 200,
      render: (categories: string[] | string) => {
        const categoryArray = Array.isArray(categories)
          ? categories
          : categories
          ? categories
              .split(',')
              .map(cat => cat.trim())
              .filter(Boolean)
          : []

        return renderTagPills(categoryArray, 3, 2)
      },
      filters: getUniqueCategories().map(category => ({ text: category, value: category })),
      onFilter: (value: string, record: Library) => {
        const categoryArray = parseTagsOrCategories(record.categories)
        return categoryArray.includes(value)
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (record: Library) => (
        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
          <Button
            size="small"
            onClick={e => {
              e.stopPropagation()
              onViewMiqaats?.(record)
            }}>
            Miqaats
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex h-full">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarVisible ? 'lg:w-[calc(100%-420px)]' : 'w-full'}`}>
          <div className="h-full overflow-auto px-6 py-8 space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {quickStats.map(stat => (
                <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-200/60 border border-slate-100">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.accent} text-white flex items-center justify-center text-sm font-semibold`}>{stat.value}</div>
                  <p className="mt-3 text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-xs text-slate-400">Updated live from the library feed</p>
                </div>
              ))}
            </section>

            {(highlightedTags.length > 0 || highlightedCategories.length > 0) && (
              <section className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <IconFilter className="h-4 w-4 text-indigo-500" />
                    Quick filters
                    {hasActiveQuickFilters && <span className="text-xs text-indigo-500 font-semibold">({activeTagFilters.length + activeCategoryFilters.length} active)</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hasActiveQuickFilters && (
                      <Button type="text" size="small" onClick={clearQuickFilters} className="text-indigo-600">
                        Clear filters
                      </Button>
                    )}
                    {onCreateLibrary && (
                      <Button type="primary" icon={<IconPlus className="h-4 w-4" />} size="small" onClick={onCreateLibrary}>
                        New Item
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {highlightedTags.map((tag, index) => renderFilterChip(`#${tag}`, tag, 'tag', index))}
                  {highlightedCategories.map((category, index) => renderFilterChip(category, category, 'category', index + highlightedTags.length))}
                  {highlightedTags.length === 0 && highlightedCategories.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <IconMoodSmile className="h-4 w-4" />
                      Tags will appear once items include metadata.
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-3xl bg-white/95 border border-slate-100 shadow-2xl shadow-slate-200/70 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4 gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Library overview</p>
                  <p className="text-xs text-slate-500">Tap any row to open the detail designer</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button icon={<IconRefresh className="h-4 w-4" />} onClick={() => refetch(false, true)} size="small">
                    Sync
                  </Button>
                  <Button icon={<IconCloudUpload className="h-4 w-4" />} size="small" onClick={() => message.info('Select an item to manage uploads in the sidebar.')}>
                    Bulk Upload
                  </Button>
                </div>
              </div>
              <div className="bg-white">
                <Table
                  columns={columns}
                  showFooter
                  data={filteredLibraries}
                  rowKey="id"
                  sticky={true}
                  $clickable={true}
                  onRow={record => ({
                    onClick: () => handleItemSelect(record),
                    style: {
                      cursor: 'pointer',
                      backgroundColor: record.id === selectedItem?.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                    },
                  })}
                  loading={loading}
                  refetch={refetch}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    hasNextPage: hasNextPage,
                  }}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Right Sidebar */}
        {sidebarVisible && selectedItem && (
          <div className="w-full max-w-[420px] shadow-[0_20px_35px_-25px_rgba(79,70,229,0.7)] overflow-auto border-l border-slate-100 bg-white">
            <ItemSidebar
              item={selectedItem}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              onClose={handleSidebarClose}
              onSave={handleSaveChanges}
              onDelete={() => handleDelete(selectedItem.id)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Item Sidebar Component
interface ItemSidebarProps {
  item: Library
  editingItem: Partial<Library>
  setEditingItem: (item: Partial<Library>) => void
  onClose: () => void
  onSave: () => void
  onDelete: () => void
}

const ItemSidebar = ({ item, editingItem, setEditingItem, onClose, onSave, onDelete }: ItemSidebarProps) => {
  const baseId = `library-${item.id}`
  const audioUploadId = `${baseId}-audio-replace`
  const audioNewUploadId = `${baseId}-audio-new`
  const pdfUploadId = `${baseId}-pdf-replace`
  const pdfNewUploadId = `${baseId}-pdf-new`

  const handleFileUpload = async (file: File, type: 'audio' | 'pdf') => {
    try {
      const result = await StorageService.uploadFile(file, type, item.name)
      if (result.success && result.url) {
        setEditingItem({ ...editingItem, [type === 'audio' ? 'audio_url' : 'pdf_url']: result.url })
        message.success(`${type.toUpperCase()} uploaded successfully`)
      } else {
        message.error(result.error || 'Upload failed')
      }
    } catch (error) {
      message.error('Upload failed')
      console.error('Upload error:', error)
    }
  }

  const handleDeleteFile = async (type: 'audio' | 'pdf') => {
    try {
      const url = type === 'audio' ? editingItem.audio_url : editingItem.pdf_url
      if (!url) return

      const path = extractPathFromUrl(url)
      if (path) {
        await StorageService.deleteFile(path, type)
      }

      setEditingItem({ ...editingItem, [type === 'audio' ? 'audio_url' : 'pdf_url']: undefined })
      message.success(`${type.toUpperCase()} deleted successfully`)
    } catch (error) {
      message.error('Delete failed')
      console.error('Delete error:', error)
    }
  }

  const extractPathFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'audio' || part === 'pdf')
      if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) return null
      return pathParts.slice(bucketIndex + 1).join('/')
    } catch {
      return null
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-5 py-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">Now editing</p>
            <h3 className="mt-1 text-lg font-semibold leading-snug">{item.name}</h3>
            <p className="text-xs text-white/80">{item.album || 'Uncategorized album'}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full border border-white/40 text-white hover:bg-white/20 transition">
            ✕
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/80">
          <span className="rounded-full bg-white/20 px-3 py-1">{editingItem.audio_url ? 'Audio attached' : 'Add audio'}</span>
          <span className="rounded-full bg-white/20 px-3 py-1">{editingItem.pdf_url ? 'PDF attached' : 'Add PDF'}</span>
          <span className="rounded-full bg-white/20 px-3 py-1">{editingItem.youtube_url ? 'YouTube linked' : 'Add video'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 overflow-auto bg-slate-50 px-5 py-6">
        {/* Basic Info */}
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Details
          </div>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Title</label>
              <Input value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} placeholder="Enter title" size="middle" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Description</label>
              <Input.TextArea
                value={editingItem.description || ''}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Short summary for this entry"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Album</label>
              <Select
                value={editingItem.album}
                onChange={value => setEditingItem({ ...editingItem, album: value })}
                placeholder="Select album"
                className="w-full"
                options={Object.values(AlbumEnum).map(album => ({ label: album, value: album }))}
              />
            </div>
            <div className="space-y-1.5 flex flex-col w-full max-w-full">
              <label className="text-xs font-medium text-slate-500">Tags</label>
              <Select
                mode="tags"
                value={
                  Array.isArray(editingItem.tags)
                    ? editingItem.tags
                    : editingItem.tags
                    ? String(editingItem.tags)
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean)
                    : []
                }
                onChange={value => {
                  setEditingItem({ ...editingItem, tags: value })
                }}
              />
            </div>
            <div className="space-y-1.5 w-full max-w-full flex flex-col">
              <label className="text-xs font-medium text-slate-500">Categories</label>
              <Select
                mode="tags"
                allowClear
                onClear={() => setEditingItem({ ...editingItem, categories: [] })}
                value={
                  Array.isArray(editingItem.categories)
                    ? editingItem.categories
                    : editingItem.categories
                    ? String(editingItem.categories)
                        .split(',')
                        .map(cat => cat.trim())
                        .filter(Boolean)
                    : []
                }
                onChange={value => {
                  setEditingItem({ ...editingItem, categories: value })
                }}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Media */}
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <IconUpload className="h-4 w-4 text-indigo-500" />
            Media vault
          </div>

          {/* Audio */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-700">
              <span>Audio file</span>
              {editingItem.audio_url ? <span className="text-emerald-600">Attached</span> : <span className="text-indigo-400">Awaiting upload</span>}
            </div>
            <p className="mt-1 text-xs text-indigo-500/80">Drop an .mp3, .wav, or .m4a to instantly update.</p>
            <div className="mt-3 flex gap-2">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'audio')
                  e.target.value = ''
                }}
                className="hidden"
                id={audioUploadId}
              />
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'audio')
                  e.target.value = ''
                }}
                className="hidden"
                id={audioNewUploadId}
              />
              <Button type="primary" size="small" className="bg-indigo-600 text-white border-none hover:bg-indigo-500" onClick={() => document.getElementById(audioUploadId)?.click()}>
                {editingItem.audio_url ? 'Replace' : 'Upload audio'}
              </Button>
              {editingItem.audio_url && (
                <>
                  <Button size="small" onClick={() => document.getElementById(audioNewUploadId)?.click()}>
                    Add variant
                  </Button>
                  <Button type="text" size="small" danger onClick={() => handleDeleteFile('audio')}>
                    Remove
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* PDF */}
          <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
              <span>PDF document</span>
              {editingItem.pdf_url ? <span className="text-emerald-600">Attached</span> : <span className="text-rose-400">Awaiting upload</span>}
            </div>
            <p className="mt-1 text-xs text-rose-500/80">Upload annotated PDF references for this item.</p>
            <div className="mt-3 flex gap-2">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'pdf')
                  e.target.value = ''
                }}
                className="hidden"
                id={pdfUploadId}
              />
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'pdf')
                  e.target.value = ''
                }}
                className="hidden"
                id={pdfNewUploadId}
              />
              <Button type="primary" size="small" className="bg-rose-600 text-white border-none hover:bg-rose-500" onClick={() => document.getElementById(pdfUploadId)?.click()}>
                {editingItem.pdf_url ? 'Replace' : 'Upload PDF'}
              </Button>
              {editingItem.pdf_url && (
                <Button type="text" size="small" danger onClick={() => handleDeleteFile('pdf')}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* YouTube */}
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <IconBrandYoutube className="h-4 w-4 text-red-500" />
            Add a YouTube reference
          </div>
          <p className="mt-1 text-xs text-slate-500">Paste a full YouTube URL to keep learners within context.</p>
          <Input className="mt-3" value={editingItem.youtube_url || ''} onChange={e => setEditingItem({ ...editingItem, youtube_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
        </section>
      </div>

      {/* Footer */}
      <div className="space-y-2 border-t border-slate-100 bg-white px-5 py-4">
        <Button type="primary" onClick={onSave} className="w-full border-none bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500 text-white shadow-lg hover:shadow-xl">
          Save changes
        </Button>
        <Popconfirm title="Delete this item?" description="This action cannot be undone." onConfirm={onDelete} okText="Delete" cancelText="Cancel">
          <Button type="text" danger className="w-full">
            <IconTrash className="mr-2 h-4 w-4" />
            Delete item
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}

export default LibraryList
