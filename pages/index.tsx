import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Data Converter</title>
        <meta name="description" content="An app to convert between various data formats" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold">
          Welcome to the Data Converter!
        </h1>

        <p>
          Content to follow.
        </p>
      </main>

      <footer>
        Created by Stephen Pinto
      </footer>
    </div>
  )
}

export default Home
