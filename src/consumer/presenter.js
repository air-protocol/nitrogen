const presentOpenCases = (adjudications) => {
    console.log('Proposal request ids in dispute')
    adjudications.forEach((value, key)=> {
        console.log(key)
    });
}

module.exports = { presentOpenCases }