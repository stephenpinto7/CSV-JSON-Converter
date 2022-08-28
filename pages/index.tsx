import type { NextPage } from "next";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/inconsolata";
import Head from "next/head";
import {
  AppBar,
  Button,
  Container,
  FormGroup,
  FormControlLabel,
  Grid,
  Select,
  Switch,
  TextField,
  Toolbar,
  Typography,
  MenuItem,
  Paper,
  FormControl,
  FormLabel,
  CssBaseline
} from "@mui/material";
import { useEffect, useState } from "react";
import { parse as parseCsv } from "csv-parse/browser/esm/sync";
import { stringify as csvStringify } from "csv-stringify/browser/esm/sync";
import { Stack } from "@mui/system";
import { SnackbarProvider, useSnackbar } from "notistack";

type FormatType = "CSV" | "JSON";

function HeadData() {
  return (
    <Head>
      <title>Data Converter</title>
      <meta
        name="description"
        content="An app to convert between various data formats"
      />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}

interface InputDataProps {
  sourceFormats: FormatType[];
  selectedFormat: FormatType;
  selectFormat: (s: FormatType) => void;
  setData: (d: unknown) => void;
  setParseError: (s: string) => void;
}
function InputData({
  sourceFormats,
  selectedFormat,
  selectFormat,
  setParseError,
  setData
}: InputDataProps) {
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    try {
      if (selectedFormat === "CSV") {
        setData(parseCsv(inputText, { columns: true }));
      } else {
        setData(JSON.parse(inputText));
      }
      setParseError(""); // Clear potential error
    } catch (error) {
      if (error instanceof Error) {
        setParseError(`${error.name} - ${error.message}`);
      } else {
        setParseError(JSON.stringify(error, null, "\t"));
      }
    }
  }, [inputText, selectedFormat, setData, setParseError]);

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
            <FormControl size="small" sx={{ minWidth: "5em" }}>
              <FormLabel>Source Format</FormLabel>
              <Select
                variant="outlined"
                value={selectedFormat}
                onChange={(e) => selectFormat(e.target.value as FormatType)}
              >
                {sourceFormats.map((format) => (
                  <MenuItem key={format} value={format}>
                    {format}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            multiline
            rows={8}
            fullWidth
            InputProps={{
              sx: { fontFamily: "Inconsolata, monospace", tabSize: 4 }
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

interface TransformedDataProps {
  data: unknown;
  sourceFormat: FormatType;
  parseError: string;
}
function TransformedData({
  data,
  sourceFormat,
  parseError
}: TransformedDataProps) {
  const [pretty, setPretty] = useState(true);
  const targetFormat = sourceFormat === "CSV" ? "JSON" : "CSV";
  const { enqueueSnackbar } = useSnackbar();

  if (!Array.isArray(data)) {
    parseError = "Top level JSON should be an array";
  } else {
    const validTypes = ["number", "string", "boolean"];
    for (const entry of data) {
      if (typeof entry !== "object" || entry === null) {
        parseError = "JSON should be an array of objects.";
      } else {
        for (const key of Object.keys(entry)) {
          if (!validTypes.includes(typeof entry[key])) {
            parseError = `Properties on the objects should be primitive types, got ${typeof entry[
              key
            ]}`;
            break;
          }
        }
      }
    }
  }

  let convertedData = "";
  if (parseError.length === 0) {
    try {
      if (sourceFormat === "CSV") {
        convertedData = JSON.stringify(data, null, pretty ? "\t" : "");
      } else {
        convertedData = csvStringify(data as object[], { header: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        convertedData = `${error.name} - ${error.message}`;
      } else {
        convertedData = JSON.stringify(error, null, "\t");
      }
    }
  } else {
    convertedData = parseError;
  }

  const copyToClipboard = async () => {
    try {
      if (convertedData) {
        await navigator.clipboard.writeText(convertedData);
        enqueueSnackbar("Text copied to clipboard!", {
          variant: "success",
          anchorOrigin: { horizontal: "center", vertical: "bottom" }
        });
      }
    } catch (error) {
      console.error("Error copying to clipboard: %o", error);
      enqueueSnackbar("Unable to copy text to clipboard!", {
        variant: "error",
        anchorOrigin: { horizontal: "center", vertical: "bottom" }
      });
    }
  };

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
            <Button variant="contained" onClick={copyToClipboard}>
              Copy
            </Button>
          </Grid>
          {targetFormat === "JSON" && (
            <Grid item>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pretty}
                      onChange={(e) => setPretty(e.target.checked)}
                    />
                  }
                  label="Pretty"
                />
              </FormGroup>
            </Grid>
          )}
        </Grid>
        <Grid item xs={12}>
          <TextField
            value={convertedData}
            multiline
            rows={8}
            fullWidth
            InputProps={{
              sx: { fontFamily: "Inconsolata, monospace", tabSize: 4 }
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

const Home: NextPage = () => {
  const sourceFormats: FormatType[] = ["CSV", "JSON"];

  const [data, setData] = useState<unknown>(null);
  const [sourceFormat, setSourceFormat] = useState<FormatType>("CSV");
  const [parseError, setParseError] = useState("");

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
            <InputData
              sourceFormats={sourceFormats}
              selectedFormat={sourceFormat}
              selectFormat={setSourceFormat}
              setParseError={setParseError}
              setData={setData}
            />
            <TransformedData
              data={data}
              sourceFormat={sourceFormat}
              parseError={parseError}
            />
          </Stack>
        </Container>
        <Container>
          <Typography variant="caption">
            Created by Stephen Pinto (
            <a href="mailto:spinto7@hotmail.com">spinto7@hotmail.com</a>)
          </Typography>
        </Container>
      </SnackbarProvider>
    </>
  );
};

export default Home;
