const fs = require('fs');
const path = require('path');

module.exports = {
	name: '/',
	run: async (req, res) => {
		delete require.cache[require.resolve('../html/home.html')];

		const file = fs.readFileSync(path.join(__dirname, '../html/home.html'), { encoding: 'utf8' });

		res.send(file);
	},
};