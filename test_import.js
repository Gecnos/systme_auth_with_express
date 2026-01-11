try {
    await import('./src/lib/prisma.js');
    console.log('Import success');
} catch (e) {
    console.error(e);
}
