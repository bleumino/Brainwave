const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');
const output = document.getElementById('output');

processBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    output.textContent = "Please upload a file first!";
    return;
  }

  if (file.type === "text/plain") {
    const text = await file.text();
    generateStudyMaterial(text);
  } else if (file.type === "application/pdf") {
    const text = await extractPDFText(file);
    generateStudyMaterial(text);
  } else {
    output.textContent = "Unsupported file type. Try .txt or .pdf";
  }
});

async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(i => i.str).join(" ") + "\n";
  }
  return text;
}

function generateStudyMaterial(text) {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 3).join(". ") + ".";
  const question = sentences[0] ? "What is the main idea of: " + sentences[0].slice(0, 60) + "..." : "What did you learn?";

  output.innerHTML = `
    <h2>🧠 Summary</h2>
    <p>${summary}</p>
    <h2>🎯 Flashcard</h2>
    <p><strong>Q:</strong> ${question}</p>
    <p><strong>A:</strong> ${sentences[1] || "Think about the core idea."}</p>
    <h2>💡 Tip</h2>
    <p>Break your document into smaller chunks to review each section daily.</p>
  `;
}