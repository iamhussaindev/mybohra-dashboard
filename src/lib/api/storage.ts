import { supabase } from '@lib/config/supabase'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

export class StorageService {
  private static readonly AUDIO_BUCKET = 'audio'
  private static readonly PDF_BUCKET = 'pdf'

  /**
   * Upload file to Supabase storage
   */
  static async uploadFile(file: File, type: 'audio' | 'pdf', fileName?: string): Promise<UploadResult> {
    try {
      const bucket = type === 'audio' ? this.AUDIO_BUCKET : this.PDF_BUCKET
      const fileExt = file.name.split('.').pop()
      const filePath = fileName ? `${fileName}.${fileExt}` : `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        console.error('Upload error:', error)
        return { success: false, error: error.message }
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  /**
   * Check if file exists in storage
   */
  static async checkFileExists(path: string, type: 'audio' | 'pdf'): Promise<boolean> {
    try {
      const bucket = type === 'audio' ? this.AUDIO_BUCKET : this.PDF_BUCKET
      const { data, error } = await supabase.storage.from(bucket).list('', {
        search: path,
      })

      if (error) {
        console.error('Check file error:', error)
        return false
      }

      return data && data.length > 0 && data.some(file => file.name === path)
    } catch (error) {
      console.error('Check file error:', error)
      return false
    }
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(path: string, type: 'audio' | 'pdf'): Promise<boolean> {
    try {
      const bucket = type === 'audio' ? this.AUDIO_BUCKET : this.PDF_BUCKET
      const { error } = await supabase.storage.from(bucket).remove([path])

      if (error) {
        console.error('Delete file error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Delete file error:', error)
      return false
    }
  }

  /**
   * Get public URL for file
   */
  static getPublicUrl(path: string, type: 'audio' | 'pdf'): string {
    const bucket = type === 'audio' ? this.AUDIO_BUCKET : this.PDF_BUCKET
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(path: string, type: 'audio' | 'pdf') {
    try {
      const bucket = type === 'audio' ? this.AUDIO_BUCKET : this.PDF_BUCKET
      const { data, error } = await supabase.storage.from(bucket).list('', {
        search: path,
      })

      if (error || !data || data.length === 0) {
        return null
      }

      const file = data.find(f => f.name === path)
      return file
    } catch (error) {
      console.error('Get metadata error:', error)
      return null
    }
  }
}
