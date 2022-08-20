import type { NextPage } from 'next';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Head from 'next/head';
import { Card, CardActions, CardHeader, CardContent, Container, FormGroup, FormControlLabel, Grid, Switch, TextField, Typography } from '@mui/material';
import { ChangeEvent, useState } from 'react';

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

interface InputDataProps {
  inputText: string,
  updateText: (e: ChangeEvent<HTMLInputElement>) => unknown
};
function InputData({ inputText, updateText }: InputDataProps) {
  return (
    <Card>
      <CardHeader title="Enter data to transform" />
      <CardContent>
        <TextField value={inputText} onChange={updateText} multiline rows={30} fullWidth />
      </CardContent>
    </Card>
  );
}

interface TransformedDataProps {
  data: string;
}
function TransformedData({ data }: TransformedDataProps) {

  const [pretty, setPretty] = useState(true);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPretty(event.target.checked);
  };
  let convertedData;

  try {
    const csvData = parseCsv(data, { columns: true });
    convertedData = JSON.stringify(csvData, null, pretty ? '\t' : '');
  } catch (error) {
    convertedData = JSON.stringify(error, null, '\t');
  }

  return (
    <Card>
      <CardHeader title="Transformed text" />
      <CardContent>
        <FormGroup>
          <FormControlLabel control={<Switch checked={pretty} onChange={handleChange} />} label="Pretty" />
        </FormGroup>
        <TextField value={convertedData} multiline rows={30} fullWidth />
      </CardContent>
    </Card>
  );
}

const Home: NextPage = () => {
  const [inputText, setInputText] = useState('');

  const updateText = (event: ChangeEvent<HTMLInputElement>) => {
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
        <Grid container direction="row" alignItems="stretch" justifyContent="space-evenly">
          <Grid item xs={5}>
            <InputData inputText={inputText} updateText={updateText} />
          </Grid>
          <Grid item xs={5}>
            <TransformedData data={inputText} />
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
