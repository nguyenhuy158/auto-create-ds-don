const fs = require('fs').promises;

exports.readArrayFromFile = async function readArrayFromFile(filePath = './data.json') {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const dataArray = JSON.parse(fileContent);
        return dataArray;
    } catch (error) {
        console.error('Error reading file:', error.message);
        if (error.code === 'ENOENT') {
            await fs.writeFile(filePath, '[]', 'utf-8');
        }
        return [];
    }
};

exports.writeArrayToFile = async function writeArrayToFile(data, filePath = './data.json') {
    try {
        const currentData = await exports.readArrayFromFile();
        const dataArray = [data, ...currentData];
        const jsonString = JSON.stringify(dataArray, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf-8');
        console.log(`Data successfully written to ${filePath}`);
    } catch (error) {
        console.error('Error writing to file:', error.message);
        return;
    }
};