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
        console.error("Failed to fetch token:", err)
      } finally {
        setLoadingToken(false)
      }
    }

    fetchToken()
  }, [success]) // Refetch setelah update berhasil

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
      </div>
    </div>
  )
}
