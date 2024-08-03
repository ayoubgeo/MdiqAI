export let assistantId = "asst_42Lbu83x9NYCjqGpl9Yjqa6V"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
