import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Layout({ title, keywords, description, children }) {
  const router = useRouter()

  return (
    <div>
      <Head>
        <title>{title}</title>

        <link rel="icon" type="image/png" href="/mooditude-logo.png" />
        
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />       
        <link
          rel="stylesheet"
          type="text/css"
          charset="UTF-8"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        /> 
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