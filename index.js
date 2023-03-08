const { Configuration, OpenAIApi } = require("openai");
const apiKey = "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";
const fs = require("fs");
const configuration = new Configuration({
  apiKey,
});

const openai = new OpenAIApi(configuration);

const model = "text-davinci-003";
const promptDelimiter = "\n";

fs.readFile(`${__dirname}/storage.json`, "utf-8", (err, data) => {
  const jsonl = JSON.parse(data);
  const newData = jsonl.reduce((acc, cur) => {
    acc += JSON.stringify({ prompt: cur.text, completion: cur.explanation });
    acc += "\n";
    return acc;
  }, "");
  fs.writeFile(`${__dirname}/train-test.jsonl`, newData, (err) => {
    console.log(err?.message);
  });
});

async function fineTuneModel() {
  // Upload the dataset file
  const response = await openai.createFile(
    fs.createReadStream("train-test.jsonl"),
    "fine-tune"
  );

  // Fine Tune the model with the uploaded file id
  const response2 = await openai.createFineTune({
    training_file: response.data.id,
    model: "davinci",
    n_epochs: 3,
  });

  response2.data.name = "fine-tune-demo";
  fs.readFile(`${__dirname}/fine-tunes.json`, "utf-8", (err, data) => {
    const oldData = JSON.parse(data);
    oldData.push(response2);
    fs.writeFile(`${__dirname}/fine-tunes.json`, oldData, (err) => {
      console.log(err?.message);
    });
  });

  console.log(response2);
}

fineTuneModel();

const displayFineTunes = async () => {
  const list = await openai.listFineTunes();
  console.log(list.data.data);
};

displayFineTunes();
