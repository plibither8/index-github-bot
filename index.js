const {json} = require('micro');
const github = require('gh-got');
const stripIndent = require('common-tags/lib/stripIndent');

module.exports = async req => {
	const {action, repository: repo} = await json(req);
	if (action &&
		(action === 'created' || action === 'publicized')
		&& !repo.fork
		&& !repo.private
	) {
		return await github.post(`repos/${process.env.GITHUB_USERNAME}/index/issues`, {
			body: {
				title: `Add ${repo.name}`,
				body: stripIndent`
				\`\`\`yaml
				- name: ${repo.name}
				  link: ${repo.html_url}
				  description: ${repo.description || ''}
				  archived: false
				\`\`\`

				[Edit index.yaml](../edit/master/index.yaml)
				`
			}
		}).then(() => 'OK', error => {
			throw error.response.body
		});
	}
	return 'meh';
}
