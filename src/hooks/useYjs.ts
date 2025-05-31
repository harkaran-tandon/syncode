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

  // Awareness
  const states = providerRef.current ? Array.from(providerRef.current.awareness.getStates().values()) : []
  const connectedUsers = states.map((state: any) => state.user).filter(Boolean)

  const user = useRef(() => {
    const filteredNames = namesWithColors.filter(({ name }) => !connectedUsers.includes(name));
    const randomUser = filteredNames.length > 0
      ? filteredNames[Math.floor(Math.random() * filteredNames.length)]
      : { name: "Anonymous", hex: "#cccccc" };
    return { name: randomUser.name, color: randomUser.hex };
  }).current;

  useEffect(() => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('ws://localhost:1234', roomName, ydoc)

    const yText = ydoc.getText('monaco')      // code editor content
    const yOutput = ydoc.getText('output')

    provider.awareness.setLocalStateField('user', user)

    provider.on('status', (event: { status: string }) => {
      console.log(`[Yjs] ${event.status}`)
    })

    ydocRef.current = ydoc
    providerRef.current = provider
    yTextRef.current = yText
    yOutputRef.current = yOutput

    setReady(true)

    return () => {
      provider.destroy()
      ydoc.destroy()
    }
  }, [roomName, user])

  return {
    ydocRef,
    providerRef,
    yTextRef,
    yOutputRef,
    ready,
  }
}
