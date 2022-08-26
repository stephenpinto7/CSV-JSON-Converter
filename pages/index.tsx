import type { NextPage } from 'next';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/inconsolata';
import Head from 'next/head';
import { Alert, AppBar, Button, Card, CardHeader, CardContent, Container, FormGroup, FormControlLabel, Grid, Select, type SelectChangeEvent, Switch, TextField, Toolbar, Typography, MenuItem, InputLabel, Paper, FormControl, FormHelperText, FormLabel, CssBaseline, Snackbar } from '@mui/material';
import { useState } from 'react';
import { parse as parseCsv } from 'csv-parse/browser/esm/sync';
import { stringify as csvStringify } from 'csv-stringify/browser/esm/sync';
import { Stack } from '@mui/system';
import { SnackbarProvider, useSnackbar } from 'notistack';

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

interface DisplayParseErrorProps {
  parseError: string | null;
}
function DisplayParseError({ parseError }: DisplayParseErrorProps) {
  return (
    <>
      {
        parseError !== null &&
        <Grid item>
          <Alert variant="filled" severity="error">{parseError}</Alert>
        </Grid>
      }
    </>
  );
}

interface InputDataProps {
  inputText: string,
  updateText: (s: string) => void,
  sourceFormats: FormatType[],
  selectedFormat: FormatType,
  selectFormat: (s: FormatType) => void,
  parseError: string;
};
function InputData({ inputText, updateText, sourceFormats, selectedFormat, selectFormat, parseError }: InputDataProps) {
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
        <Grid item xs={12} container spacing={3} alignItems="flex-end">
          <Grid item>
            <FormControl size="small" sx={{ minWidth: '5em' }}>
              <FormLabel>Source Format</FormLabel>
              <Select variant="outlined" value={selectedFormat} onChange={e => selectFormat(e.target.value as FormatType)} >
                {sourceFormats.map(format => <MenuItem key={format} value={format}>{format}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <DisplayParseError parseError={parseError} />
        </Grid>
        <Grid item xs={12}>
          <TextField value={inputText} onChange={e => updateText(e.target.value)} multiline rows={8} fullWidth InputProps={{ sx: { fontFamily: 'Inconsolata, monospace', tabSize: 4 } }} />
        </Grid>
      </Grid>
    </Paper>
  );
}

interface TransformedDataProps {
  data: string;
  sourceFormat: FormatType;
  setParseError: (s: string | null) => void;
}
function TransformedData({ data, sourceFormat, setParseError }: TransformedDataProps) {
  const [pretty, setPretty] = useState(true);
  let parsedData: unknown[] | null = null;
  let convertedData: string | null = null;
  const { enqueueSnackbar } = useSnackbar();

  const targetFormat = sourceFormat === 'CSV' ? 'JSON' : 'CSV';
  try {
    if (sourceFormat === 'CSV') {
      parsedData = parseCsv(data, { columns: true });

    } else if (sourceFormat === 'JSON') {
      try {
        parsedData = JSON.parse(data);
        let errorSet = false;
        if (!Array.isArray(parsedData)) {
          setParseError('Top level JSON should be an array.');
          errorSet = true;
        } else {
          const validTypes = ['number', 'string', 'boolean'];
          for (const entry of parsedData) {
            if (typeof entry !== 'object' || entry === null) {
              setParseError('JSON should be an array of objects.');
              errorSet = true
              break;
            } else {
              for (const key of Object.keys(entry)) {
                if (!validTypes.includes(typeof (entry as Record<string, string>)[key])) {
                  setParseError('Properties on the objects should be primitive types.');
                  errorSet = true;
                  break;
                }
              }
            }
  
          }
        }
  
        if (!errorSet) {
          setParseError(null);
        }
      } catch (error) {
        console.error('Parse error: %o', error);
        setParseError((error as SyntaxError).message);
      }

    } else {
      throw Error(`Unknown source format type: ${sourceFormat}`);
    }

    if (targetFormat === 'CSV') {
      convertedData = csvStringify(parsedData!, { header: true });
    } else if (targetFormat === 'JSON') {
      convertedData = JSON.stringify(parsedData, null, pretty ? '\t' : '');
    } else {
      throw Error(`Unknown source format type: ${sourceFormat}`);
    }
  } catch (error) {
    convertedData = JSON.stringify(error, null, '\t');
  }

  const copyToClipboard = async () => {
    try {
      if (convertedData) {
        await navigator.clipboard.writeText(convertedData);
        enqueueSnackbar('Text copied to clipboard!', { variant: 'success', anchorOrigin: { horizontal: 'center', vertical: 'bottom' } });
      }
    } catch (error) {
      console.error('Error copying to clipboard: %o', error);
      enqueueSnackbar('Unable to copy text to clipboard!', { variant: 'error', anchorOrigin: { horizontal: 'center', vertical: 'bottom' } });
    }
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
      <Grid container spacing={3} padding={2} alignItems="flex-end">
        <Grid item xs={12} container spacing={3} alignItems="flex-end">
          <Grid item>
            <Button variant="contained" onClick={copyToClipboard}>Copy</Button>
          </Grid>
          {
            targetFormat === 'JSON' &&
            <Grid item>
              <FormGroup>
                <FormControlLabel control={<Switch checked={pretty} onChange={e => setPretty(e.target.checked)} />} label="Pretty" />
              </FormGroup>
            </Grid>
          }
        </Grid>
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
  const [sourceFormat, setSourceFormat] = useState<FormatType>('CSV');
  const [parseError, setParseError] = useState<string | null>(null);

  return (
    <>
      <SnackbarProvider maxSnack={3}>
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
            <InputData inputText={inputText} updateText={setInputText} sourceFormats={sourceFormats} selectedFormat={sourceFormat} selectFormat={setSourceFormat} parseError={parseError} />
            <TransformedData data={inputText} sourceFormat={sourceFormat} setParseError={setParseError} />
          </Stack>
        </Container>
        <Container>
          <Typography variant="caption">
            Created by Stephen Pinto
          </Typography>
        </Container>
      </SnackbarProvider>
    </>
  )
}

export default Home
