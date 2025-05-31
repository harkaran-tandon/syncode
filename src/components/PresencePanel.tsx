import { useEffect, useState } from 'react'
import { Awareness } from 'y-protocols/awareness'

interface User {
  name: string
  hex: string
}

interface PresencePanelProps {
  awareness: Awareness
  theme?: 'light' | 'vs-dark'
}

export const PresencePanel: React.FC<PresencePanelProps> = ({ awareness, theme }) => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    // ✅ Set local user into awareness
    const localUser = JSON.parse(localStorage.getItem('user_id') || '{}')
    awareness.setLocalStateField('user', localUser)

    const onChange = () => {
      const states = Array.from(awareness.getStates().entries())

      const connectedUsers = states
        .map(([, state]: [number, any]) => {
          if (!state.user) return null
          return state.user
        })
        .filter(Boolean)

      setUsers(connectedUsers)
    }

    awareness.on('change', onChange)
    onChange()

    return () => awareness.off('change', onChange)
  }, [awareness])

  return (
    <div className={`${theme === 'vs-dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-4 rounded-md shadow-md inline-block ml-auto`}>
      <h2 className="text-lg font-semibold mb-2">Online Users ({users.length})</h2>
      <ul className="flex space-x-4 justify-end">
        {users.map((user, idx) => (
          <li key={idx} className="flex items-center space-x-2 min-w-max">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: user.hex }}
            />
            <span className="truncate">{user.name}</span>
          </li>
        ))}
      </ul>
    </div>

  )
}
