import type { NextPage } from 'next';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/inconsolata';
import Head from 'next/head';
import { Alert, AppBar, Card, CardHeader, CardContent, Container, FormGroup, FormControlLabel, Grid, Select, type SelectChangeEvent, Switch, TextField, Toolbar, Typography, MenuItem, InputLabel, Paper, FormControl, FormHelperText, FormLabel, CssBaseline } from '@mui/material';
import { useEffect, useState } from 'react';
import { parse as parseCsv } from 'csv-parse/browser/esm/sync';
import { stringify as csvStringify } from 'csv-stringify/browser/esm/sync';
import { Stack } from '@mui/system';

type FormatType = 'CSV' | 'JSON';

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
  updateText: (s: string) => void,
  sourceFormats: FormatType[],
  selectedFormat: FormatType,
  selectFormat: (s: FormatType) => void,
};
function InputData({ inputText, updateText, sourceFormats, selectedFormat, selectFormat }: InputDataProps) {
  return (
    <Paper elevation={6}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography variant="h5" component="h2">
            Source Data
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container spacing={3} padding={2}>
        <Grid item xs={12}>
          <FormControl size="small" sx={{ minWidth: '5em' }}>
            <FormLabel>Source Format</FormLabel>
            <Select variant="outlined" value={selectedFormat} onChange={e => selectFormat(e.target.value as FormatType)} >
              {sourceFormats.map(format => <MenuItem key={format} value={format}>{format}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField value={inputText} onChange={e => updateText(e.target.value)} multiline rows={8} fullWidth InputProps={{ sx: { fontFamily: 'Inconsolata, monospace', tabSize: 4 } }} />
        </Grid>
      </Grid>
    </Paper>
  );
}

function validateJson(json: unknown) {
  if (!Array.isArray(json)) {
    return (
      <Alert variant="filled" severity="error">
            Top level JSON should be an array.
      </Alert>
    );
  }

  const validTypes = ['number', 'string', 'boolean'];
  for (const entry of json) {
    if (typeof entry !== 'object') {
      return (
        <Alert variant="filled" severity="error">
            JSON should be an array of objects
        </Alert>
      );
    }

    for (const key of Object.keys(entry)) {
      if (!validTypes.includes(typeof entry[key])) {
        return (
          <Alert variant="filled" severity="error">
            Properties on the objects should be primitive types
          </Alert>
        );
      }
    }
  }

  return undefined;
}

interface TransformedDataProps {
  data: string;
  targetFormats: FormatType[];
  sourceFormat: FormatType;
  targetFormat: FormatType;
  setTargetFormat: (s: FormatType) => void
}
function TransformedData({ data, targetFormats, sourceFormat, targetFormat, setTargetFormat }: TransformedDataProps) {
  const [pretty, setPretty] = useState(true);
  let feedBackTextStatus = false;
  let parsedData;
  let convertedData;
  let feedBackText;
  try {
    if (sourceFormat === 'CSV') {
      parsedData = parseCsv(data, { columns: true });

    } else if (sourceFormat === 'JSON') {
      parsedData = JSON.parse(data);
      feedBackText = validateJson(parsedData);
      if (feedBackText) {
        feedBackTextStatus = true;
      }
    } else {
  throw Error(`Unknown source format type: ${sourceFormat}`);
}

if (targetFormat === 'CSV') {
  convertedData = csvStringify(parsedData, { header: true });
} else if (targetFormat === 'JSON') {
  convertedData = JSON.stringify(parsedData, null, pretty ? '\t' : '');
} else {
  throw Error(`Unknown source format type: ${sourceFormat}`);
}
  } catch (error) {
  convertedData = JSON.stringify(error, null, '\t');
}

return (
  <Paper elevation={6}>
    <AppBar position="static" color="secondary">
      <Toolbar>
        <Typography variant="h5" component="h2">
          Converted Data
        </Typography>
      </Toolbar>
    </AppBar>
    <Grid container spacing={3} padding={2} alignItems="center">
      <Grid item xs={12} container spacing={3} alignItems="center">
        <Grid item>
          <FormControl size="small" sx={{ minWidth: '5em' }}>
            <FormLabel>Target Format</FormLabel>
            <Select variant="outlined" value={targetFormat} onChange={e => setTargetFormat(e.target.value as FormatType)} >
              {targetFormats.map(format => <MenuItem key={format} value={format}>{format}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormGroup>
            <FormControlLabel control={<Switch checked={pretty} onChange={e => setPretty(e.target.checked)} />} label="Pretty" />
          </FormGroup>
        </Grid>
      </Grid>
      {feedBackTextStatus &&
        <Grid item>{feedBackText}</Grid>
      }
      <Grid item xs={12}>
        <TextField value={convertedData} multiline rows={8} fullWidth InputProps={{ sx: { fontFamily: 'Inconsolata, monospace', tabSize: 4 } }} />
      </Grid>
    </Grid>
  </Paper>
);
}

const Home: NextPage = () => {
  const sourceFormats: FormatType[] = ['CSV', 'JSON'];

  const [inputText, setInputText] = useState('');
  const [sourceFormat, setSourceFormat] = useState('' as FormatType);
  const [targetFormat, setTargetFormat] = useState('' as FormatType);
  const [targetFormats, setTargetFormats] = useState(sourceFormats.slice());

  useEffect(() => {
    if (sourceFormat === targetFormat) {
      setTargetFormat('' as FormatType);
    }
    setTargetFormats(sourceFormats.filter((format) => format !== sourceFormat));
  }, [sourceFormat]);

  return (
    <>
      <HeadData />
      <CssBaseline />
      <AppBar position="static" elevation={3} sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h4" component="h1">
            Welcome to the JSON/CSV Converter!
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth={false}>
        <Stack spacing={5}>
          <InputData inputText={inputText} updateText={setInputText} sourceFormats={sourceFormats} selectedFormat={sourceFormat} selectFormat={setSourceFormat} />
          <TransformedData data={inputText} targetFormats={targetFormats} targetFormat={targetFormat} setTargetFormat={setTargetFormat} sourceFormat={sourceFormat} />
        </Stack>
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
