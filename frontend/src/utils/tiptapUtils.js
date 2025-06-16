export function extractTextFromTiptapJSON(content) {
  try {
    const json = typeof content === 'string' ? JSON.parse(content) : content;
    let text = '';

    const traverseNodes = (nodes) => {
      if (!nodes) return;
      nodes.forEach(node => {
        if (node.type === 'text' && node.text) {
          text += node.text + ' ';
        }
        if (node.content) {
          traverseNodes(node.content);
        }
      });
    };

    if (json.content) {
      traverseNodes(json.content);
    }

    return text.trim().substring(0, 100); // Limit to 100 characters for preview
  } catch (err) {
    console.error('Error parsing Tiptap JSON:', err);
    return '';
  }
}