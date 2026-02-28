'use client'

import type { JSX } from 'react'

import styles from './styles.module.css'

interface Props extends React.HTMLProps<HTMLDivElement> {
  id?: string
  href: string
}

function FootnoteForwardReference({ id, href, children }: Props): JSX.Element {
  const scroll = () => {
    const id = href.replace(/^#/, '')
    const footnote = document.getElementById(id)

    if (footnote) {
      window.scrollTo({
        top: footnote.getBoundingClientRect().top + window.scrollY,
        behavior: 'smooth',
      })
    }
  }

  return (
    <button
      id={id}
      type="button"
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
      className={styles['footnote-forward-reference']}
    >
      [{children}]
    </button>
  )
}

export default FootnoteForwardReference
