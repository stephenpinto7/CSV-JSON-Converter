import type { NextPage } from 'next';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Head from 'next/head';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import * as React from 'react';

import { parse as parseCsv } from 'csv-parse/browser/esm/sync';

function HeadData() {
  return (
    <Head>
      <title>Data Converter</title>
      <meta name="description" content="An app to convert between various data formats" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}

const Home: NextPage = () => {
  const [inputText, setInputText] = React.useState('');
  const convertedText = React.useMemo(() => JSON.stringify(parseCsv(inputText, { columns: true }), null, '\t'), [inputText]);

  const updateText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  }

  return (
    <>
      <HeadData />
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Welcome to the Data Converter!
        </Typography>
      </Container>
      <Container component="main" maxWidth={false}>
        <Grid container direction="row" alignItems="center" justifyContent="space-evenly">
          <Grid item xs={5}>
            <Card>
              <CardHeader title="Enter data to transform" />
              <CardContent>
                <TextField value={inputText} onChange={updateText} multiline rows={30} fullWidth />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={5}>
          <Card>
              <CardHeader title="Transformed text" />
              <CardContent>
                <TextField value={convertedText} multiline rows={30} fullWidth />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Container>
        <Typography variant="caption">
          Created by Stephen Pinto
        </Typography>
      </Container>
    </>
  )
}

export default Home
