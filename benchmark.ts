import Graphemer from './src/Graphemer';

// Test strings with various complexities
const testStrings = {
  ascii:
    'Hello World! This is a simple ASCII string with numbers 12345 and punctuation.',
  emoji: '👨‍👩‍👧‍👦 👋🏽 🇺🇸 ❤️ 😀 🎉 ✨ 🚀 💻 📱',
  mixed: 'Hello 👋 World 🌍! Mixed ASCII and emoji 😊 with numbers 123.',
  korean: '안녕하세요 세계! 한국어 문자열입니다.',
  complex: 'Test with combining chars: é è ê ë à â ä and zalgo t̶̛̗͕̣̲͙̩͙̹̘̖̬̗̟̳̠̮̻̭̾̈́̐͛̐̌̀̈́̀̈́͒̈́̆̎̌̈ẽ̸̡̨̧̻̳̮̙̞̣̜̘̙̻̻̬̠̠͉̲̤͙̖̤̳̗̻̬̺͓͉̰̜̭̺͓͚̪̺̪̓̋̎͌̍͊̉͋̽̄̂͋̄̀̚͘̚͜͠͝ͅx̸̢̨̛͔͚̠̟̲̪͔̥̮̞̱͓̙̺̩̭̘͚̪͈̝̹̮̣̭̰̭̖̲͓̠̣̺̙̱̺̖͕̤͉̮̪̼̰̹̞̰͎̀̓̎̿́̔̂͊̐̽̃̐̑̆̑͒̒̈́̓͋̌̉̂̇̆̎͋́͋͘̚̚͘͜͜͝͝ͅͅt̵̛̻̮͓̱͇̟͇̪͙̩̝͈̼̫̭̝̲̹̆̈́̀͗̿̐̆͒̄̔̀͌̄͛̒͋̋͂̿̍̈́̇̕͘͘͜͝͝',
  longAscii: 'A'.repeat(1000),
  longEmoji: '😀'.repeat(1000),
};

function benchmark(
  name: string,
  fn: () => void,
  iterations: number = 10000,
): number {
  // Warm up
  for (let i = 0; i < 100; i++) {
    fn();
  }

  // Actual benchmark
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = process.hrtime.bigint();

  const durationMs = Number(end - start) / 1_000_000;
  const opsPerSec = (iterations / durationMs) * 1000;

  console.log(
    `${name.padEnd(40)} | ${durationMs.toFixed(2).padStart(10)}ms | ${opsPerSec
      .toFixed(0)
      .padStart(12)} ops/sec`,
  );

  return durationMs;
}

function main() {
  console.log('\n='.repeat(70));
  console.log('Graphemer Performance Benchmark');
  console.log('='.repeat(70));

  const graphemer = new Graphemer();

  console.log(
    '\nTest Case                                |       Time |   Operations/sec',
  );
  console.log('-'.repeat(70));

  // Benchmark each test string
  Object.entries(testStrings).forEach(([name, str]) => {
    const iterations = str.length > 100 ? 1000 : 10000;

    // splitGraphemes
    benchmark(
      `${name}: splitGraphemes (${str.length} chars)`,
      () => graphemer.splitGraphemes(str),
      iterations,
    );

    // countGraphemes
    benchmark(
      `${name}: countGraphemes (${str.length} chars)`,
      () => graphemer.countGraphemes(str),
      iterations,
    );

    // iterateGraphemes
    benchmark(
      `${name}: iterateGraphemes (${str.length} chars)`,
      () => {
        const it = graphemer.iterateGraphemes(str);
        for (const _ of it) {
          // iterate through all
        }
      },
      iterations,
    );
  });

  console.log('-'.repeat(70));

  // Test cache effectiveness
  console.log('\nCache Effectiveness Test:');
  console.log('-'.repeat(70));

  const testStr = 'Hello 👋 World 🌍!';

  // First run - populate cache
  const firstRunTime = benchmark(
    'First run (cold cache)',
    () => graphemer.splitGraphemes(testStr),
    10000,
  );

  // Second run - use cache
  const secondRunTime = benchmark(
    'Second run (warm cache)',
    () => graphemer.splitGraphemes(testStr),
    10000,
  );

  const speedup = firstRunTime / secondRunTime;
  console.log(`\nCache speedup: ${speedup.toFixed(2)}x faster`);

  console.log('\n' + '='.repeat(70));
  console.log('Optimizations Applied:');
  console.log('='.repeat(70));
  console.log('1. Property lookup caching (Map-based LRU cache)');
  console.log('2. Break position caching for repeated strings');
  console.log('3. Fast path for ASCII characters');
  console.log('4. Optimized iteration with minimal allocations');
  console.log('='.repeat(70) + '\n');
}

main();
