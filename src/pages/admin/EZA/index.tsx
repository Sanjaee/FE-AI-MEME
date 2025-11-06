import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatTimeAgo } from "@/utils/format"
import { ArrowLeft } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export default function AdminPage() {
  const router = useRouter()
  const [authAccessToken, setAuthAccessToken] = useState("")
  const [authRefreshToken, setAuthRefreshToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [currentToken, setCurrentToken] = useState<{
    authAccessToken: string
    authRefreshToken: string
    updatedAt: string
  } | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)
  
  // OpenRouter API Key states
  const [openRouterApiKey, setOpenRouterApiKey] = useState("")
  const [loadingApiKey, setLoadingApiKey] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [apiKeySuccess, setApiKeySuccess] = useState(false)
  const [currentApiKey, setCurrentApiKey] = useState<{
    apiKey: string
    updatedAt: string
    createdAt: string
  } | null>(null)
  const [loadingCurrentApiKey, setLoadingCurrentApiKey] = useState(true)

  // Fetch current token saat component mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoadingToken(true)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.zascript.com'
        const response = await axios.get(`${backendUrl}/api/ai-token/token`)
        const data = response.data

        if (data.success) {
          setCurrentToken(data.data)
        }
      } catch (err) {
        // Only log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch token:", err)
        }
      } finally {
        setLoadingToken(false)
      }
    }

    fetchToken()
  }, [success]) // Refetch setelah update berhasil

  // Fetch current OpenRouter API Key saat component mount
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setLoadingCurrentApiKey(true)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.zascript.com'
        const response = await axios.get(`${backendUrl}/api/openrouter`)
        const data = response.data

        if (data.success) {
          setCurrentApiKey(data.data)
        }
      } catch (err) {
        // Only log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to fetch OpenRouter API Key:", err)
        }
      } finally {
        setLoadingCurrentApiKey(false)
      }
    }

    fetchApiKey()
  }, [apiKeySuccess]) // Refetch setelah update berhasil

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!authAccessToken || !authRefreshToken) {
      setError("Both access token and refresh token are required")
      setLoading(false)
      return
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.zascript.com'
      const response = await axios.post(`${backendUrl}/api/ai-token/update`, {
        authAccessToken,
        authRefreshToken,
      })

      const data = response.data

      if (data.success) {
        setSuccess(true)
        setAuthAccessToken("")
        setAuthRefreshToken("")
        
        // Refetch token setelah update
        const tokenResponse = await axios.get(`${backendUrl}/api/ai-token/token`)
        const tokenData = tokenResponse.data
        if (tokenData.success) {
          setCurrentToken(tokenData.data)
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        throw new Error(data.message || "Failed to update token")
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingApiKey(true)
    setApiKeyError(null)
    setApiKeySuccess(false)

    if (!openRouterApiKey || openRouterApiKey.trim() === '') {
      setApiKeyError("OpenRouter API Key is required")
      setLoadingApiKey(false)
      return
    }

    // Validate API key format (should start with sk-or-v1-)
    if (!openRouterApiKey.trim().startsWith('sk-or-v1-')) {
      setApiKeyError("Invalid API key format. OpenRouter API keys should start with 'sk-or-v1-'")
      setLoadingApiKey(false)
      return
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.zascript.com'
      const response = await axios.post(`${backendUrl}/api/openrouter/update`, {
        apiKey: openRouterApiKey.trim(),
      })

      const data = response.data

      if (data.success) {
        setApiKeySuccess(true)
        setOpenRouterApiKey("")
        
        // Refetch API key setelah update
        const apiKeyResponse = await axios.get(`${backendUrl}/api/openrouter`)
        const apiKeyData = apiKeyResponse.data
        if (apiKeyData.success) {
          setCurrentApiKey(apiKeyData.data)
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setApiKeySuccess(false)
        }, 3000)
      } else {
        throw new Error(data.message || "Failed to update OpenRouter API Key")
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setApiKeyError(err.response.data.message)
      } else {
        setApiKeyError(err instanceof Error ? err.message : "An error occurred")
      }
    } finally {
      setLoadingApiKey(false)
    }
  }


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        {/* Card untuk menampilkan token yang sudah disensor */}
        <Card>
          <CardHeader>
            <CardTitle>Current Token</CardTitle>
            <CardDescription>
              Current authentication tokens stored in database (masked for security)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingToken ? (
              <div className="text-center py-4">Loading token...</div>
            ) : currentToken ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Access Token (Masked)</Label>
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-md font-mono text-sm break-all">
                    {currentToken.authAccessToken}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Refresh Token (Masked)</Label>
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-md font-mono text-sm break-all">
                    {currentToken.authRefreshToken}
                  </div>
                </div>
                {currentToken.updatedAt && (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Last updated: {formatTimeAgo(currentToken.updatedAt)} ago
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                No token found in database
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card untuk update token */}
        <Card>
          <CardHeader>
            <CardTitle>Update Token</CardTitle>
            <CardDescription>
              Update authentication tokens for AI token API. Make sure the token with ID 1 already exists in the database.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert variant="success">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Tokens updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  type="text"
                  placeholder="Enter access token"
                  value={authAccessToken}
                  onChange={(e) => setAuthAccessToken(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="refreshToken">Refresh Token</Label>
                <Input
                  id="refreshToken"
                  type="text"
                  placeholder="Enter refresh token"
                  value={authRefreshToken}
                  onChange={(e) => setAuthRefreshToken(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Token"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Card untuk menampilkan OpenRouter API Key yang sudah disensor */}
        <Card>
          <CardHeader>
            <CardTitle>Current OpenRouter API Key</CardTitle>
            <CardDescription>
              Current OpenRouter API Key stored in database (masked for security)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCurrentApiKey ? (
              <div className="text-center py-4">Loading API Key...</div>
            ) : currentApiKey ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key (Masked)</Label>
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-md font-mono text-sm break-all">
                    {currentApiKey.apiKey}
                  </div>
                </div>
                {currentApiKey.updatedAt && (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    Last updated: {formatTimeAgo(currentApiKey.updatedAt)} ago
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                No OpenRouter API Key found in database
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card untuk update OpenRouter API Key */}
        <Card>
          <CardHeader>
            <CardTitle>Update OpenRouter API Key</CardTitle>
            <CardDescription>
              Update OpenRouter API Key for AI chat functionality. The API key will be stored securely in the database.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleApiKeySubmit}>
            <CardContent className="space-y-4">
              {apiKeyError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{apiKeyError}</AlertDescription>
                </Alert>
              )}
              
              {apiKeySuccess && (
                <Alert variant="success">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    OpenRouter API Key updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 mb-4">
                <Label htmlFor="openRouterApiKey">OpenRouter API Key</Label>
                <Input
                  id="openRouterApiKey"
                  type="text"
                  placeholder="Enter OpenRouter API Key"
                  value={openRouterApiKey}
                  onChange={(e) => setOpenRouterApiKey(e.target.value)}
                  disabled={loadingApiKey}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={loadingApiKey}
                className="w-full"
              >
                {loadingApiKey ? "Updating..." : "Update API Key"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
