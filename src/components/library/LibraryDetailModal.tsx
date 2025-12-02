'use client'

import { LibraryService } from '@lib/api/library'
import { IconBook, IconFile, IconMusic, IconTag, IconX } from '@tabler/icons-react'
import { Library } from '@type/library'
import { Button, Input, Modal, Select, Tag, message } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

interface LibraryDetailModalProps {
  library: Library | null
  open: boolean
  onClose: () => void
}

export default function LibraryDetailModal({ library, open, onClose }: LibraryDetailModalProps) {
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [editableTags, setEditableTags] = useState<string[]>([])
  const [editableCategories, setEditableCategories] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [savingTaxonomy, setSavingTaxonomy] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  if (!library) return null

  const handlePlayAudio = () => {
    if (!library.audio_url) return

    if (audioPlaying) {
      audioRef.current?.pause()
      setAudioPlaying(false)
    } else {
      if (audioRef.current) {
        audioRef.current.src = library.audio_url
        audioRef.current
          .play()
          .then(() => {
            setAudioPlaying(true)
            setAudioError(false)
          })
          .catch(error => {
            console.error('Audio playback error:', error)
            setAudioError(true)
            setAudioPlaying(false)
          })
      }
    }
  }

  const handleAudioEnded = () => {
    setAudioPlaying(false)
  }

  const handleAudioError = () => {
    setAudioError(true)
    setAudioPlaying(false)
  }

  const getAlbumColor = (album?: string) => {
    switch (album) {
      case 'SAHIFA':
        return 'purple'
      case 'MUNAJAAT':
        return 'blue'
      case 'QURAN':
        return 'green'
      case 'HADITH':
        return 'orange'
      default:
        return 'default'
    }
  }

  const parseList = (value: string[] | string | null | undefined) => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean)
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }

  const tags = parseList((library as any).tags)
  const categories = parseList((library as any).categories)

  useEffect(() => {
    setEditableTags(tags)
    setEditableCategories(categories)
    setTagInput('')
    setCategoryInput('')
  }, [library?.id])

  const taxonomyDirty = useMemo(() => {
    const tagsChanged = JSON.stringify(editableTags) !== JSON.stringify(tags)
    const categoriesChanged = JSON.stringify(editableCategories) !== JSON.stringify(categories)
    return tagsChanged || categoriesChanged
  }, [editableTags, editableCategories, tags, categories])

  const addTag = () => {
    const value = tagInput.trim()
    if (!value || editableTags.includes(value)) return
    setEditableTags(prev => [...prev, value])
    setTagInput('')
  }

  const addCategory = () => {
    const value = categoryInput.trim()
    if (!value || editableCategories.includes(value)) return
    setEditableCategories(prev => [...prev, value])
    setCategoryInput('')
  }

  const removeTag = (value: string) => {
    setEditableTags(prev => prev.filter(tag => tag !== value))
  }

  const removeCategory = (value: string) => {
    setEditableCategories(prev => prev.filter(category => category !== value))
  }

  const handleSaveTaxonomy = async () => {
    if (!library) return
    setSavingTaxonomy(true)
    try {
      await LibraryService.update(library.id, {
        tags: editableTags,
        categories: editableCategories,
      })
      message.success('Tags and categories updated')
    } catch (error) {
      console.error(error)
      message.error('Failed to update taxonomy')
    } finally {
      setSavingTaxonomy(false)
    }
  }

  return (
    <>
      <Modal open={open} onCancel={onClose} footer={null} closeIcon={null} width={820} bodyStyle={{ padding: 0 }} destroyOnClose>
        <div className="overflow-hidden rounded-3xl bg-white">
          <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 px-8 py-8 text-white">
            <button className="absolute right-6 top-6 rounded-full border border-white/20 p-2 text-white hover:bg-white/15" onClick={onClose}>
              <IconX className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em]">
              <IconBook className="h-4 w-4" />
              Library detail
            </div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">{library.name}</h2>
            {library.description && <p className="mt-2 max-w-2xl text-sm text-white/80">{library.description}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-[11px] uppercase text-white/70">Album</p>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
                  <Tag color={getAlbumColor(library.album)} className="mt-2 border-none font-semibold">
                    {library.album || 'Uncategorized'}
                  </Tag>
                </div>
              </div>
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-[11px] uppercase text-white/70">Audio</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <IconMusic className="h-4 w-4" />
                  {library.audio_url ? 'Available' : 'Missing'}
                </div>
              </div>
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-[11px] uppercase text-white/70">PDF</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <IconFile className="h-4 w-4" />
                  {library.pdf_url ? 'Attached' : 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-white px-8 py-8">
            <section className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <IconTag className="h-4 w-4 text-indigo-500" />
                  Taxonomy
                  {taxonomyDirty && <span className="text-xs text-indigo-500">Unsaved changes</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="small" type="default" disabled={!taxonomyDirty} loading={savingTaxonomy} onClick={handleSaveTaxonomy}>
                    Save Tags
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tags</p>

                  <div className="flex gap-2">
                    <Input size="small" value={tagInput} placeholder="Add tag" onChange={e => setTagInput(e.target.value)} onPressEnter={addTag} />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Categories</p>

                  <div className="flex gap-2">
                    <Select mode="tags" options={categories.map(category => ({ label: category, value: category }))} value={editableCategories} onChange={value => setEditableCategories(value)} />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Audio</p>
                <Button
                  disabled={!library.audio_url || audioError}
                  icon={audioPlaying ? <IconX className="h-4 w-4" /> : <IconMusic className="h-4 w-4" />}
                  className="mt-3 w-full"
                  type="primary"
                  onClick={handlePlayAudio}>
                  {library.audio_url ? (audioPlaying ? 'Stop audio' : 'Play audio') : 'No audio'}
                </Button>
                {audioError && <p className="mt-2 text-xs text-red-500">Failed to load audio asset.</p>}
              </div>
              <div className="rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">PDF</p>
                <Button disabled={!library.pdf_url} className="mt-3 w-full" icon={<IconFile className="h-4 w-4" />} href={library.pdf_url || undefined} target="_blank" rel="noopener noreferrer">
                  {library.pdf_url ? 'Open PDF' : 'Not uploaded'}
                </Button>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">YouTube</p>
                <Button
                  disabled={!library.youtube_url}
                  className="mt-3 w-full"
                  icon={<IconFile className="h-4 w-4" />}
                  href={library.youtube_url || undefined}
                  target="_blank"
                  rel="noopener noreferrer">
                  {library.youtube_url ? 'Watch session' : 'No link yet'}
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="grid gap-4 text-sm md:grid-cols-2">
                {library.created_at && library.created_at !== '1970-01-01T00:00:00.000Z' && (
                  <div>
                    <p className="text-xs uppercase text-slate-400">Created</p>
                    <p className="text-slate-700">{new Date(library.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                {library.updated_at && library.updated_at !== '1970-01-01T00:00:00.000Z' && (
                  <div>
                    <p className="text-xs uppercase text-slate-400">Updated</p>
                    <p className="text-slate-700">{new Date(library.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </section>

            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} onError={handleAudioError} className="hidden" />
    </>
  )
}
