'use client'

import { SupabaseService, authService } from '@lib/api/supabase'
import { isSupabaseConfigured } from '@lib/config/supabase'
import { useEffect, useState } from 'react'

interface Project {
  id: string
  title: string
  description: string
  created_at: string
}

export default function SupabaseExample() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Check if Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please check your environment variables.')
    }
  }, [])

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch {
        console.log('No user logged in')
      }
    }

    getUser()
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch projects
  const fetchProjects = async () => {
    if (!isSupabaseConfigured()) return

    setLoading(true)
    setError(null)

    try {
      // This assumes you have a 'projects' table in your Supabase database
      const data = await SupabaseService.select<Project>('projects')
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  // Add a new project
  const addProject = async () => {
    if (!isSupabaseConfigured()) return

    setLoading(true)
    setError(null)

    try {
      const newProject = {
        title: 'New Project',
        description: 'This is a new project created via Supabase',
      }

      await SupabaseService.insert('projects', newProject)
      await fetchProjects() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add project')
    } finally {
      setLoading(false)
    }
  }

  // Sign in example
  const handleSignIn = async () => {
    try {
      await authService.signIn('test@example.com', 'password')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    }
  }

  // Sign out
  const handleSignOut = async () => {
    try {
      await authService.signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Supabase Not Configured</h3>
        <p className="text-red-600 mb-4">Please add your Supabase credentials to your .env.local file:</p>
        <pre className="bg-red-100 p-3 rounded text-sm text-red-800">
          {`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
        </pre>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Supabase Integration Example</h2>

      {/* Authentication Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Authentication</h3>
        {user ? (
          <div>
            <p className="text-green-600 mb-2">Logged in as: {user.email}</p>
            <button onClick={handleSignOut} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Not logged in</p>
            <button onClick={handleSignIn} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Sign In (Demo)
            </button>
          </div>
        )}
      </div>

      {/* Database Operations Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Database Operations</h3>
        <div className="flex gap-2 mb-4">
          <button onClick={fetchProjects} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
            {loading ? 'Loading...' : 'Fetch Projects'}
          </button>
          <button onClick={addProject} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">
            Add Project
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 mb-4">{error}</div>}

        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Projects ({projects.length})</h4>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found. Click &quot;Add Project&quot; to create one.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map(project => (
                <li key={project.id} className="p-2 bg-white rounded border">
                  <h5 className="font-medium">{project.title}</h5>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <p className="text-xs text-gray-400">Created: {new Date(project.created_at).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600">
        <p className="mb-2">
          <strong>Note:</strong> This example assumes you have a &apos;projects&apos; table in your Supabase database.
        </p>
        <p>
          Check the <code>SUPABASE_SETUP.md</code> file for complete setup instructions.
        </p>
      </div>
    </div>
  )
}
