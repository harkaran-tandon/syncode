import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export const namesWithColors = [
  { name: "Snugglepup", hex: "#F6C6B4" },
  { name: "Fluffaroo", hex: "#C3E0E5" },
  { name: "Wiggletail", hex: "#D9B2FF" },
  { name: "Bunnykins", hex: "#FFDDD2" },
  { name: "Snickerdog", hex: "#FFDCA9" },
  { name: "Whiskerly", hex: "#A3D2CA" },
  { name: "Cuddlemeow", hex: "#E8DFF5" },
  { name: "Nibblebun", hex: "#FFC6C7" },
  { name: "Fuzzykins", hex: "#B2EBF2" },
  { name: "Pompaws", hex: "#FFD6E8" },
  { name: "Meowster", hex: "#C6D8FF" },
  { name: "Waddlewoo", hex: "#FFF3B0" },
  { name: "Snugglefox", hex: "#FFB997" },
  { name: "Chirplee", hex: "#FFDAC1" },
  { name: "Muffinpup", hex: "#E4C1F9" },
  { name: "Hootsie", hex: "#9AD1D4" },
  { name: "Barklebee", hex: "#FFABAB" },
  { name: "Tailyboo", hex: "#FFD6A5" },
  { name: "Ruffster", hex: "#FF677D" },
  { name: "Peachpaw", hex: "#FDE2FF" },
]

export function useYjs(roomName: string) {
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const yTextRef = useRef<Y.Text | null>(null)
  const yOutputRef = useRef<Y.Text | null>(null)
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<{ name: string; color: string } | null>(null)

  useEffect(() => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('wss://y-websocket-server-production.up.railway.app', roomName, ydoc)

    const yText = ydoc.getText('monaco')      // code editor content
    const yOutput = ydoc.getText('output')

    ydocRef.current = ydoc
    providerRef.current = provider
    yTextRef.current = yText
    yOutputRef.current = yOutput

    function assignUser() {
      // Get current connected user names from awareness states
      const states = Array.from(provider.awareness.getStates().values())
      const connectedNames = states.map((state: any) => state.user?.name).filter(Boolean)

      // Filter names not taken
      const availableNames = namesWithColors.filter(({ name }) => !connectedNames.includes(name))

      if (availableNames.length > 0) {
        // Pick random available name
        const randomUser = availableNames[Math.floor(Math.random() * availableNames.length)]
        setUser({ name: randomUser.name, color: randomUser.hex })
        provider.awareness.setLocalStateField('user', { name: randomUser.name, color: randomUser.hex })
      } else {
        // Fallback anonymous user with random color
        setUser({ name: "Anonymous", color: "#cccccc" })
        provider.awareness.setLocalStateField('user', { name: "Anonymous", color: "#cccccc" })
      }
    }

    // Wait for awareness connection before assigning user
    provider.on('status', (event: { status: string }) => {
      if (event.status === 'connected') {
        assignUser()
        setReady(true)
      }
    })

    const onAwarenessReady = () => {
      const hasSelf = provider.awareness.getLocalState()?.user
      if (!hasSelf) assignUser()
      setReady(true)
    }
    
    // Wait until WebSocket is connected
    if (provider.wsconnected) {
      onAwarenessReady()
    } else {
      provider.on('status', (event: { status: string }) => {
        if (event.status === 'connected') {
          onAwarenessReady()
        }
      })
    }

    return () => {
      provider.destroy()
      ydoc.destroy()
    }
  }, [roomName])

  return {
    ydocRef,
    providerRef,
    yTextRef,
    yOutputRef,
    ready,
    user,
  }
}
