'use client'

import Image from 'next/image'
import type { StatusLevel } from '@/data/types'
import { ILLUSTRATION_MAP } from '@/data/constants'

interface IllustrationPanelProps {
  readonly status: StatusLevel
  readonly variant?: 'hero' | 'card' | 'inline'
  readonly className?: string
}

function getCharacters(status: StatusLevel, count: number): readonly string[] {
  return ILLUSTRATION_MAP[status].slice(0, count)
}

export function IllustrationPanel({ status, variant = 'card', className = '' }: IllustrationPanelProps) {
  const characters = getCharacters(status, variant === 'hero' ? 5 : 3)

  if (variant === 'hero') {
    return (
      <div className={`flex items-end justify-center gap-3 ${className}`}>
        {characters.map((char, i) => (
          <Image
            key={char}
            src={`/illustrations/${char}`}
            alt=""
            width={i === 2 ? 72 : 56}
            height={i === 2 ? 90 : 70}
            className="object-contain"
          />
        ))}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-end gap-1 ${className}`}>
        {characters.slice(0, 2).map((char) => (
          <Image key={char} src={`/illustrations/${char}`} alt="" width={32} height={40} className="object-contain" />
        ))}
      </div>
    )
  }

  return (
    <div className={`flex items-end justify-center gap-2 py-2 ${className}`}>
      {characters.map((char) => (
        <Image key={char} src={`/illustrations/${char}`} alt="" width={48} height={60} className="object-contain" />
      ))}
    </div>
  )
}

interface HandGestureProps {
  readonly type: 'thumbsUp' | 'wave' | 'point' | 'ok'
  readonly size?: number
  readonly className?: string
}

const HAND_MAP: Record<string, string> = {
  thumbsUp: 's_hand01.png',
  wave: 's_hand02.png',
  point: 's_hand03.png',
  ok: 's_hand04.png',
}

export function HandGesture({ type, size = 40, className = '' }: HandGestureProps) {
  return (
    <Image
      src={`/illustrations/${HAND_MAP[type]}`}
      alt="" width={size} height={size}
      className={`object-contain ${className}`}
    />
  )
}
