import AuthGuard from '@components/auth/AuthGuard'
import LibraryInlineEditor from '@components/library/LibraryInlineEditor'

export default function LibraryInlineEditorPage() {
  return (
    <AuthGuard>
      <LibraryInlineEditor />
    </AuthGuard>
  )
}

