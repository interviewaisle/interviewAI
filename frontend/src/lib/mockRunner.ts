import type { Terminal } from 'xterm'
import type { ExitStatus } from '@/types'

export function simulateMockExecution(
  term: Terminal,
  onExit: (status: ExitStatus) => void
): void {
  term.write('\x1b[33mSpinning up sandbox...\x1b[0m\r\n')
  setTimeout(() => term.write('\x1b[32mRunning main.py\x1b[0m\r\n'), 600)
  setTimeout(() => term.write('Hello, world!\r\n'), 1100)
  setTimeout(() => term.write('\x1b[32m✓ All tests passed (3/3)\x1b[0m\r\n'), 1500)
  setTimeout(() => onExit('PASS'), 1700)
}
