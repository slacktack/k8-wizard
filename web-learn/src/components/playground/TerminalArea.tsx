import TerminalWindow from '../terminal/TerminalWindow';

interface PlaygroundStep {
  id: number;
  title: string;
  cmd: string;
  output: string[];
}

interface TerminalAreaProps {
  lines: { cmd: string; output: string[] }[];
  currentStep?: PlaygroundStep;
}

export default function TerminalArea({ lines, currentStep }: TerminalAreaProps) {
  const terminalLines = [
    ...lines.flatMap(l => [
      { type: 'input' as const, prompt: 'k8s-master:~$ ', cmd: l.cmd },
      ...(l.output.length > 0 ? [{ type: 'output' as const, output: l.output.join('\n') }] : []),
    ]),
    ...(currentStep && !lines.find(l => l.cmd === currentStep.cmd)
      ? [{ type: 'output' as const, output: `▸ Next: ${currentStep.title}` }]
      : []),
  ];

  return (
    <TerminalWindow
      title="k8s-master@playground — 80×24"
      lines={terminalLines}
      typingSpeed={20}
    />
  );
}
