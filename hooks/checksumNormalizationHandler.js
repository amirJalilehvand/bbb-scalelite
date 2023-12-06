

module.exports = (word) => {
    let finalString = word?word.replace(/'/g, ''):null;
    return finalString;
}