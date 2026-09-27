export function createTerminalEngine(commands) {
  const log = [];
  let historyIndex = -1;

  function run(rawInput) {
    const trimmed = rawInput.trim();
    log.push(rawInput);
    historyIndex = log.length;

    if (!trimmed) return { echo: rawInput, output: [], action: null };

    const key = trimmed.toLowerCase();
    const command = commands[key];

    if (!command) {
      return {
        echo: rawInput,
        output: [`Comando não reconhecido: "${trimmed}". Digite help.`],
        action: null,
      };
    }

    return {
      echo: rawInput,
      output: command.action === 'clear' ? [] : [command.run()],
      action: command.action ?? null,
    };
  }

  function navigateHistory(direction) {
    if (log.length === 0) return null;
    historyIndex = Math.min(Math.max(historyIndex + direction, 0), log.length);
    return log[historyIndex] ?? '';
  }

  return { run, navigateHistory };
}
