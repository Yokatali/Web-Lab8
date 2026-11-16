const output = document.querySelector('#output');
const buttons = document.querySelectorAll('button[data-path]');

function formatBody(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch (error) {
    return text;
  }
}

async function callRoute(method, path) {
  output.textContent = `Loading ${method} ${path} ...`;

  try {
    const response = await fetch(path, { method });
    const text = await response.text();

    output.textContent =
      `${method} ${path}\n` +
      `Status: ${response.status} ${response.statusText}\n\n` +
      formatBody(text);
  } catch (error) {
    output.textContent = `Request failed: ${error.message}`;
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    callRoute(button.dataset.method, button.dataset.path);
  });
});