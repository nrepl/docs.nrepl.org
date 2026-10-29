// Names nREPL's unversioned master docs "master" in the version menu, rather
// than "default". nREPL's doc/antora.yml says why it's not done there.
module.exports.register = function () {
  this.once('contentAggregated', ({ contentAggregate }) => {
    for (const componentVersion of contentAggregate) {
      if (!componentVersion.version) componentVersion.displayVersion ??= 'master'
    }
  })
}
