'use client'

import { Tag } from 'lucide-react'
import { SiBluesky, SiGithub, SiX } from '@icons-pack/react-simple-icons'
import DecryptedText from '@/components/decrypted-text'
import { cn } from '@/lib/cn'

const commits = [
  {
    hash: '9c413df04ea830efe665a2acab77755d031cb6245d80621b16a28147e469de8e',
    date: '2023-06',
    title: 'フロントエンドデベロッパーとして転職',
    org: 'KITERETZ inc.',
    description:
      'ウェブを追求すべく転職。HTML/CSS/JS を使ったマークアップから、WordPress やAstro と CMS を組み合わせたサイト制作、Next.js を使ったアプリケーション開発などに携わる。',
    tags: ['v3.2.8'],
  },
  {
    hash: '417873b7fe3a1de264ce8a58e4907bdf09ad5a9764e528f1f22440914d552ffc',
    date: '2018-10',
    title: 'ウェブとの邂逅',
    description:
      'グラフィックデザイナーとして転職した勤務先のウェブ担当が離脱。それによりウェブ関連の仕事を任される。サイトの企画、デザイン、写真撮影、コーディングを一通り担当。',
    tags: ['v2.8.0'],
  },
  {
    hash: 'd05f0db28585400528d8c4bde460f46172beb89ffde25462c86fb1ca11dc27c6',
    date: '2016-04',
    title: '本屋兼雑貨屋兼カフェで働き始める',
    description:
      '主に雑貨の仕入れを行う。のちにイベントのフライヤー制作やカフェのメニューデザインなどを任される。グラフィックデザインへの興味が湧き始める。',
    tags: ['v2.5.6'],
  },
  {
    hash: '46eb5a4c7b24cff7584bbc206a50652376d1fd10c625fb1e8d4026f9f9b8ef16',
    date: '2015-08',
    title: '自室を暗室にするほど写真にのめり込む',
    description:
      'モノクロフィルムにハマる。現像だけでは飽き足らず、印画紙へのプリント、額装なども自身で行う。ギャラリーに展示してもらったりもした。',
    tags: ['v2.4.10'],
  },
  {
    hash: 'd565d6ab135c4cbc9628bae47da41eefd1125f103294c32a3ac351f1e3e7a5f7',
    date: '2015-03',
    title: '6年間在籍していた大学を中退',
    description:
      '卒業論文を提出するものの、その後、猛烈に学校に行く気がなくなり退学。',
    tags: ['v2.4.5'],
  },
  {
    hash: '35c6c4baf50723d36b5dd6f17150886bb6f2a5cf08d7cc8a2c1bb589f55e1569',
    date: '2012-07',
    title: '就活中にウェブ制作に出会う',
    description:
      '就活の学びを残そうとブログを開始。ブログカスタマイズをきっかけに HTML/CSS の独学をスタート。学生ベンチャーで制作の手伝いをしたり、学生団体のサイトを作ったりする。',
    tags: ['v2.1.9'],
  },
  {
    hash: '95aa33fbc5a19d369603cf289e96556a8a12cb734a953caa0a3a7a47e463e8b1',
    date: '2006-04',
    title: '時給708円でキーボードを叩き始める',
    description:
      'スーパーでポップ (POP) 作成担当のアルバイトを始める。情報系の先輩にパソコンのいろはを教わる。できるだけショートカットキーを使えとこの時に叩き込まれる。',
    tags: ['v1.5.6'],
  },
  {
    hash: '08b6ea515b5759ef7c649c7a24686bd3a40cf9daa6f0263ac5b0031ded647087',
    date: '1990-10-11',
    title: 'Initial commit',
    description: '生まれる。',
    tags: ['v0.0.1'],
  },
]

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="flex items-center gap-1 rounded-lg bg-iris-4/75 px-2 py-0.5 font-sans text-xs leading-normal tracking-wide text-iris-11 transition-colors dark:bg-iris-3">
      <Tag className="size-2.5" />
      {tag}
    </span>
  )
}

export default function AboutPage() {
  return (
    <div>
      <header className="mt-16 mb-20">
        <h1 className="mb-2 -translate-x-px text-2xl leading-normal lg:text-3xl">
          About me
        </h1>
        <p className="mb-8 font-pixel-circle text-[0.8125rem]/[1.75] font-bold tracking-wider text-iris-11 uppercase">
          <DecryptedText
            animateOn="view"
            text={'I write code. I break code. I fix it.'}
            sequential
            speed={25}
            useOriginalCharsOnly
          />
        </p>
        <div className="mb-5">
          <p className="grid text-sm leading-[1.9] tracking-wide md:text-base">
            <span>大島翔吾です。</span>
            <span>ウェブでの表現をつくります。</span>
            <span>最近は WebGL (WebGPU) に興味津々。</span>
            <span>開発だけでなくデザインも好き。</span>
          </p>
        </div>
        <div className="relative -left-1.25 flex gap-0.5">
          {[
            {
              label: 'Bluesky',
              href: 'https://bsky.app/profile/osgsm.io',
              icon: SiBluesky,
            },
            {
              label: 'X',
              href: 'https://x.com/osgsm_',
              icon: SiX,
            },
            {
              label: 'GitHub',
              href: 'https://github.com/osgsm',
              icon: SiGithub,
            },
          ].map(({ label, href, icon: Icon }) => {
            return (
              <a
                className="p-1 text-iris-10 transition-colors hover:text-iris-11"
                key={label}
                href={href}
                title={label}
                target="_blank"
              >
                <Icon className="size-4" />
              </a>
            )
          })}
        </div>
      </header>

      <div className="relative -mr-2 -ml-3 md:mx-0">
        {commits.map((commit, i) => {
          return (
            <div
              key={commit.hash}
              className={cn(
                'relative grid cursor-default grid-cols-[auto_1fr] gap-4 transition-opacity duration-200 md:gap-6'
              )}
            >
              {/* Date + hash column */}
              <div
                className={cn(
                  'relative w-20 border-r border-border pt-1 pr-4 text-right md:w-23 md:pr-6',
                  i === commits.length - 1
                    ? 'border-transparent'
                    : 'border-border'
                )}
              >
                <div className="grid gap-1">
                  <div className="font-pixel-circle text-xs leading-none font-bold tracking-wide text-iris-11 md:text-[0.8125rem]">
                    {new Date(commit.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="font-pixel-circle text-xs font-bold tracking-wider text-iris-10">
                    {commit.hash.slice(0, 7)}
                  </div>
                </div>
                {/* Dot on the line */}
                <div
                  className={cn(
                    'absolute top-1 -right-1.75 z-10 size-3.25 rounded-full border-3 border-iris-2 bg-iris-8 dark:border-mauve-1'
                  )}
                />
              </div>

              {/* Content */}
              <div
                className={cn(
                  'w-full flex-1 transition-colors',
                  i === commits.length - 1 ? 'pb-0' : 'pb-10'
                )}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {commit.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>

                <div className="mb-2 grid gap-y-1">
                  <div
                    className={cn(
                      "font-features-['palt'] leading-snug",
                      i === commits.length - 1
                        ? 'trackint-normal'
                        : 'tracking-wider'
                    )}
                  >
                    {commit.title}
                  </div>
                  {commit.org && (
                    <div className="mt-1 text-xs text-iris-10">
                      {commit.org}
                    </div>
                  )}
                </div>

                <div className="mt-2 text-[0.8125rem] leading-[1.75] md:text-sm">
                  {commit.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
