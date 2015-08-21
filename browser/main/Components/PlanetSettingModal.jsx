var React = require('react/addons')

var Hq = require('../Services/Hq')

var LinkedState = require('../Mixins/LinkedState')

var PlanetStore = require('../Stores/PlanetStore')

module.exports = React.createClass({
  mixins: [LinkedState],
  propTypes: {
    close: React.PropTypes.func,
    planet: React.PropTypes.shape({
      name: React.PropTypes.string,
      public: React.PropTypes.bool,
      userName: React.PropTypes.string
    })
  },
  getInitialState: function () {
    var deleteTextCandidates = [
      'Confirm',
      'Exterminatus',
      'Avada Kedavra'
    ]
    var random = Math.round(Math.random() * 10) % 10
    var randomDeleteText = random > 1 ? deleteTextCandidates[0] : random === 1 ? deleteTextCandidates[1] : deleteTextCandidates[2]

    return {
      currentTab: 'profile',
      planet: {
        name: this.props.planet.name,
        public: this.props.planet.public
      },
      randomDeleteText: randomDeleteText,
      deleteConfirmation: ''
    }
  },
  activePlanetProfile: function () {
    this.setState({currentTab: 'profile'})
  },
  activePlanetDelete: function () {
    this.setState({currentTab: 'delete'})
  },
  handlePublicChange: function (value) {
    return function () {
      this.state.planet.public = value
      this.setState({planet: this.state.planet})
    }.bind(this)
  },
  handleSavePlanetProfile: function (e) {
    var planet = this.props.planet

    this.setState({profileSubmitStatus: 'sending'}, function () {
      Hq.updatePlanet(planet.userName, planet.name, this.state.planet)
        .then(function (res) {
          var planet = res.body

          this.setState({profileSubmitStatus: 'done'})

          PlanetStore.Actions.update(planet)
        }.bind(this))
        .catch(function (err) {
          this.setState({profileSubmitStatus: 'error'})
          console.error(err)
        }.bind(this))
    })
  },
  handleDeletePlanetClick: function () {
    var planet = this.props.planet

    this.setState({deleteSubmitStatus: 'sending'}, function () {
      Hq.destroyPlanet(planet.userName, planet.name)
        .then(function (res) {
          var planet = res.body

          PlanetStore.Actions.destroy(planet)
          this.setState({deleteSubmitStatus: 'done'}, function () {
            this.props.close()
          })
        }.bind(this))
        .catch(function (err) {
          this.setState({deleteSubmitStatus: 'error'})
          console.error(err)
        }.bind(this))
    })

  },
  render: function () {
    var content

    content = this.state.currentTab === 'profile' ? this.renderPlanetProfileTab() : this.renderPlanetDeleteTab()

    return (
      <div className='PlanetSettingModal modal tabModal'>
        <div className='leftPane'>
          <h1 className='tabLabel'>Planet setting</h1>
          <nav className='tabList'>
            <button onClick={this.activePlanetProfile} className={this.state.currentTab === 'profile' ? 'active' : ''}><i className='fa fa-globe fa-fw'/> Planet profile</button>
            <button onClick={this.activePlanetDelete} className={this.state.currentTab === 'delete' ? 'active' : ''}><i className='fa fa-trash fa-fw'/> Delete Planet</button>
          </nav>
        </div>

        <div className='rightPane'>
          {content}
        </div>
      </div>
    )
  },
  renderPlanetProfileTab: function () {
    return (
      <div className='planetProfileTab'>
        <div className='formField'>
          <label>Planet name </label>
          <input valueLink={this.linkState('planet.name')}/>
        </div>

        <div className='formRadioField'>
          <input id='publicOption' checked={this.state.planet.public} onChange={this.handlePublicChange(true)} name='public' type='radio'/> <label htmlFor='publicOption'>Public</label>

          <input id='privateOption' checked={!this.state.planet.public} onChange={this.handlePublicChange(false)} name='public' type='radio'/> <label htmlFor='privateOption'>Private</label>
        </div>
        <div className='formConfirm'>
          <button onClick={this.handleSavePlanetProfile} className='saveButton btn-primary'>Save</button>

          <div className={'alertInfo' + (this.state.profileSubmitStatus === 'sending' ? '' : ' hide')}>on Sending...</div>

          <div className={'alertError' + (this.state.profileSubmitStatus === 'error' ? '' : ' hide')}>Connection failed.. Try again.</div>

          <div className={'alertSuccess' + (this.state.profileSubmitStatus === 'done' ? '' : ' hide')}>Successfully done!!</div>
        </div>
      </div>
    )
  },
  renderPlanetDeleteTab: function () {
    var disabled = !this.state.deleteConfirmation.match(new RegExp('^' + this.props.planet.userName + '/' + this.props.planet.name + '$'))

    return (
      <div className='planetDeleteTab'>
        <p>Are you sure to destroy <strong>'{this.props.planet.userName + '/' + this.props.planet.name}'</strong>?</p>
        <p>If you are sure, write <strong>'{this.props.planet.userName + '/' + this.props.planet.name}'</strong> to input below and click <strong>'{this.state.randomDeleteText}'</strong> button.</p>
        <input valueLink={this.linkState('deleteConfirmation')} placeholder='userName/planetName'/>
        <div className='formConfirm'>
          <button disabled={disabled} onClick={this.handleDeletePlanetClick}>{this.state.randomDeleteText}</button>

          <div className={'alertInfo' + (this.state.deleteSubmitStatus === 'sending' ? '' : ' hide')}>on Sending...</div>

          <div className={'alertError' + (this.state.deleteSubmitStatus === 'error' ? '' : ' hide')}>Connection failed.. Try again.</div>

          <div className={'alertSuccess' + (this.state.deleteSubmitStatus === 'done' ? '' : ' hide')}>Successfully done!!</div>
        </div>
      </div>
    )
  }
})