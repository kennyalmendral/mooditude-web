import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Layout({ title, keywords, description, children }) {
  const router = useRouter()

  return (
    <div>
      <Head>
        <title>{title}</title>
        
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />        
      </Head>

      <main>
        {children}
      </main>
    </div>
  )
}

Layout.defaultProps = {
  title: 'Mooditude',
  description: '',
  keywords: ''
}