import Table from '@components/ui/atoms/Table'
import { useDebounce } from '@hooks/useDebounce'
import { LibraryService } from '@lib/api/library'
import { StorageService } from '@lib/api/storage'
import { IconBrandYoutube, IconTrash, IconUpload } from '@tabler/icons-react'
import { AlbumEnum, Library, LibraryFilters } from '@type/library'
import { Button, Input, message, Popconfirm, Select } from 'antd'
import { useEffect, useState } from 'react'

interface LibraryListProps {
  onDeleteLibrary?: (id: number) => void
  onViewMiqaats?: (library: Library) => void
  searchQuery?: string
}

const LibraryList = ({ onDeleteLibrary, onViewMiqaats, searchQuery = '' }: LibraryListProps) => {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(false)
  const [filters] = useState<LibraryFilters>({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const [hasNextPage, setHasNextPage] = useState(true)
  const [audioStates, setAudioStates] = useState<Record<number, { playing: boolean; error: boolean }>>({})
  const [dragStates, setDragStates] = useState<Record<number, { isDragOver: boolean; dragCounter: number }>>({})
  const [selectedItem, setSelectedItem] = useState<Library | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Partial<Library>>({})

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
      await LibraryService.update(selectedItem.id, editingItem)
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
        // Convert LibrarySearchResult to Library format for consistent rendering
        const searchData: Library[] = searchResults.map(result => ({
          id: result.id,
          name: result.name,
          description: result.description,
          album: result.album,
          tags: result.tags,
          categories: result.categories,
          audio_url: undefined,
          pdf_url: undefined,
          youtube_url: undefined,
          metadata: undefined,
          search_text: undefined,
          search_vector: undefined,
          created_at: '',
          updated_at: '',
        }))
        // Sort search results by name (number first, then alphabetically)
        const sortedSearchData = searchData.sort(sortLibrariesByName)
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
            <div className="font-medium text-gray-900 text-sm">{text}</div>
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
      width: 120,
      render: (record: Library) => {
        const audioState = audioStates[record.id]
        const isPlaying = audioState?.playing || false
        const hasError = audioState?.error || false

        if (!record.audio_url) {
          return <div className="text-xs text-gray-500">No audio</div>
        }

        return (
          <div className="text-xs text-gray-700">
            <span
              className="cursor-pointer hover:text-blue-600"
              onClick={e => {
                e.stopPropagation()
                toggleAudio(record)
              }}>
              {isPlaying ? '⏸️' : '▶️'} {hasError ? 'Error' : isPlaying ? 'Playing' : 'Play'}
            </span>
          </div>
        )
      },
    },
    {
      title: 'PDF',
      key: 'pdf',
      width: 120,
      render: (record: Library) => {
        if (!record.pdf_url) {
          return <div className="text-xs text-gray-500">No PDF</div>
        }

        return (
          <div className="text-xs text-gray-700">
            <a href={record.pdf_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600" onClick={e => e.stopPropagation()}>
              📄 Open PDF
            </a>
          </div>
        )
      },
    },
    {
      title: 'YouTube',
      key: 'youtube',
      width: 100,
      render: (record: Library) => (
        <div className="text-xs text-gray-700">
          {record.youtube_url ? (
            <a href={record.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600" onClick={e => e.stopPropagation()}>
              🎥 YouTube
            </a>
          ) : (
            '-'
          )}
        </div>
      ),
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

        return <div className="text-xs text-gray-700">{tagArray?.length > 0 ? tagArray.slice(0, 3).join(', ') + (tagArray.length > 3 ? ` +${tagArray.length - 3}` : '') : '-'}</div>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (record: Library) => (
        <div className="text-xs text-gray-700">
          <span
            className="cursor-pointer hover:text-blue-600"
            onClick={e => {
              e.stopPropagation()
              onViewMiqaats?.(record)
            }}>
            📅 Miqaats
          </span>
        </div>
      ),
    },
  ]

  return (
    <div className="flex h-screen ">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarVisible ? 'w-[calc(100%-400px)]' : 'w-full'}`}>
        <div className="space-y-6 h-full overflow-auto">
          <div className="bg-white/80 overflow-hidden">
            <Table
              columns={columns}
              data={libraries}
              rowKey="id"
              sticky={true}
              $clickable={true}
              onRow={record => ({
                onClick: () => handleItemSelect(record),
                style: {
                  cursor: 'pointer',
                  backgroundColor: record.id === selectedItem?.id ? 'rgb(255, 199, 199)' : 'transparent',
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
        </div>
      </div>

      {/* Right Sidebar */}
      {sidebarVisible && selectedItem && (
        <div className="w-[400px] shadow-blue-500/10 overflow-auto border-l border-gray-200">
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-3 py-4 h-[55px] bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Edit Item</h3>
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
            <span className="text-gray-500 text-sm">✕</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-4 overflow-auto">
        {/* 1. Basic Info */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <Input value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} placeholder="Enter title" size="small" className="text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <Input.TextArea
                value={editingItem.description || ''}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Enter description"
                rows={2}
                size="small"
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Album</label>
              <Select
                value={editingItem.album}
                onChange={value => setEditingItem({ ...editingItem, album: value })}
                placeholder="Select album"
                size="small"
                className="w-full text-sm"
                options={Object.values(AlbumEnum).map(album => ({ label: album, value: album }))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
              <Input
                value={Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : editingItem.tags || ''}
                onChange={e =>
                  setEditingItem({
                    ...editingItem,
                    tags: e.target.value
                      .split(',')
                      .map(tag => tag.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="tag1, tag2, tag3"
                size="small"
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categories</label>
              <Input
                value={Array.isArray(editingItem.categories) ? editingItem.categories.join(', ') : editingItem.categories || ''}
                onChange={e =>
                  setEditingItem({
                    ...editingItem,
                    categories: e.target.value
                      .split(',')
                      .map(cat => cat.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="category1, category2"
                size="small"
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* 2. Media Files */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <IconUpload className="w-4 h-4 text-green-500" />
            <h4 className="font-medium text-gray-900 text-sm">Media Files</h4>
          </div>

          {/* Audio */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Audio File</label>
            {editingItem.audio_url ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-600">🎵</span>
                  <span className="text-xs text-green-700 flex-1 truncate">Audio file present</span>
                </div>
                <div className="flex space-x-1">
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'audio')
                      e.target.value = ''
                    }}
                    className="hidden"
                    id="audio-upload"
                  />
                  <Button type="primary" size="small" onClick={() => document.getElementById('audio-upload')?.click()} className="flex-1 text-xs h-6 bg-blue-500 hover:bg-blue-600">
                    Replace
                  </Button>
                  <Button type="text" size="small" danger onClick={() => handleDeleteFile('audio')} className="text-xs h-6">
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <span className="text-xs text-gray-500">No audio file</span>
                </div>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'audio')
                    e.target.value = ''
                  }}
                  className="hidden"
                  id="audio-upload-new"
                />
                <Button type="primary" size="small" onClick={() => document.getElementById('audio-upload-new')?.click()} className="w-full text-xs h-6 bg-blue-500 hover:bg-blue-600">
                  Upload Audio
                </Button>
              </div>
            )}
          </div>

          {/* PDF */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">PDF File</label>
            {editingItem.pdf_url ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-red-600">📄</span>
                  <span className="text-xs text-red-700 flex-1 truncate">PDF file present</span>
                </div>
                <div className="flex space-x-1">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, 'pdf')
                      e.target.value = ''
                    }}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <Button type="primary" size="small" onClick={() => document.getElementById('pdf-upload')?.click()} className="flex-1 text-xs h-6 bg-blue-500 hover:bg-blue-600">
                    Replace
                  </Button>
                  <Button type="text" size="small" danger onClick={() => handleDeleteFile('pdf')} className="text-xs h-6">
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <span className="text-xs text-gray-500">No PDF file</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'pdf')
                    e.target.value = ''
                  }}
                  className="hidden"
                  id="pdf-upload-new"
                />
                <Button type="primary" size="small" onClick={() => document.getElementById('pdf-upload-new')?.click()} className="w-full text-xs h-6 bg-blue-500 hover:bg-blue-600">
                  Upload PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 3. YouTube */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
            <IconBrandYoutube className="w-4 h-4 text-red-500" />
            <h4 className="font-medium text-gray-900 text-sm">YouTube</h4>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">YouTube URL</label>
            <Input
              value={editingItem.youtube_url || ''}
              onChange={e => setEditingItem({ ...editingItem, youtube_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              size="small"
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 space-y-2">
        <Button type="primary" onClick={onSave} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 border-0 text-sm h-8 hover:shadow-md">
          Save Changes
        </Button>
        <Popconfirm title="Delete this item?" description="This action cannot be undone." onConfirm={onDelete} okText="Delete" cancelText="Cancel">
          <Button type="text" danger className="w-full text-sm h-8 hover:bg-red-50">
            <IconTrash className="w-4 h-4 mr-2" />
            Delete Item
          </Button>
        </Popconfirm>
      </div>
    </div>
  )
}

export default LibraryList
