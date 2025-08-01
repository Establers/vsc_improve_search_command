function isCommentLine(line) {
    return /^\s*(?:\/\/|#|\/\*|\*|<!--|--|;|\')/.test(line);
}

module.exports = {
    isCommentLine
};
