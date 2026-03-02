'use client'

import type { JSX } from 'react'

import { CornerDownLeftIcon } from 'lucide-react'

import styles from './styles.module.css'

interface Props {
  id?: string
  href: string
}

function FootnoteBackReference({ id, href }: Props): JSX.Element {
  const scroll = () => {
    const targetId = href.replace(/^#/, '')
    const footnote = document.getElementById(targetId)

    if (footnote) {
      const headerOffset = 100
      const elementPosition =
        footnote.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <button
      id={id}
      type="button"
      className="inline-block cursor-pointer p-1.25"
      onClick={(e) => {
        e.preventDefault()
        scroll()
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          scroll()
        }
      }}
    >
      <span className="block size-3.5">
        <CornerDownLeftIcon className="size-full text-iris-10" />
      </span>
    </button>
  )
}

export default FootnoteBackReference
