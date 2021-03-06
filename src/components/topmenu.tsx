import React, { PureComponent } from 'react';
import { Container, Dropdown, Popup, Menu, Icon, Button, Modal, Form, Grid, Message, Segment } from 'semantic-ui-react';
import { navigate } from 'gatsby';
import { isMobile } from 'react-device-detect';

import OtherPages from './otherpages';

type TopMenuProps = {};

type TopMenuState = {
	loginDialogOpen: boolean;
	loggingIn: boolean;
	user: string;
	password: string;
	errorMessage: string | undefined;
	messageModalOpen: boolean;
};

class TopMenu extends PureComponent<TopMenuProps, TopMenuState> {
	state = { user: '', password: '', errorMessage: '', loginDialogOpen: false, loggingIn: false, messageModalOpen: false };

	render() {
		const { user, password, loginDialogOpen, loggingIn, errorMessage, messageModalOpen } = this.state;
		const windowGlobal = typeof window !== 'undefined' && window;
		let isLoggedIn = windowGlobal && window.localStorage && window.localStorage.getItem('token') && window.localStorage.getItem('username');
		const userName = isLoggedIn ? window.localStorage.getItem('username') : '';

		return (
			<div>
				<Menu fixed='top' inverted>
					<Container>
						<Menu.Item onClick={() => navigate('/')}>Crew stats</Menu.Item>
						<Menu.Item onClick={() => navigate('/about')}>About</Menu.Item>
						<Dropdown item simple text='Big book'>
							<Dropdown.Menu>
								<Dropdown.Item onClick={() => navigate('/bigbook2')}>Image list (fast)</Dropdown.Item>
								<Dropdown.Item onClick={() => navigate('/bigbook')}>Complete (slow)</Dropdown.Item>
								<Dropdown.Item onClick={() => navigate('/bb')}>Text only</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
						{!isMobile && <Menu.Item onClick={() => navigate('/voyage')}>Player tools</Menu.Item>}
						<Menu.Item onClick={() => navigate('/behold')}>Behold</Menu.Item>

						<Dropdown item simple text='Pages'>
							<Dropdown.Menu>
								<Dropdown.Item onClick={() => navigate('/collections')}>Collections</Dropdown.Item>
								<Dropdown.Item onClick={() => navigate('/items')}>Items</Dropdown.Item>
								<Dropdown.Item onClick={() => navigate('/stats')}>Misc stats</Dropdown.Item>
								<Dropdown.Item onClick={() => navigate('/episodes')}>Episodes</Dropdown.Item>
								<Dropdown.Item disabled>Missions</Dropdown.Item>
								<Dropdown.Item disabled>Ships</Dropdown.Item>
								<Dropdown.Divider />
								<Dropdown.Header>All other pages</Dropdown.Header>
								<OtherPages />
							</Dropdown.Menu>
						</Dropdown>
					</Container>

					<Menu.Menu position='right'>
						<Menu.Item as='a' onClick={() => window.open('https://www.patreon.com/Datacore', '_blank')}>
							<Popup content='Donate to Community Patreon' trigger={<Icon name='patreon' />} />
						</Menu.Item>
						<Menu.Item>
							<Button size='tiny' color='green' onClick={() => this.setState({messageModalOpen: true})} content={"We've moved!"} />
						</Menu.Item>
						<Menu.Item as='a' onClick={() => window.open('https://github.com/stt-datacore/website', '_blank')}>
							<Icon name='github' />
						</Menu.Item>
						<Menu.Item as='a' onClick={() => (window as any).swapThemeCss()}>
							<Icon name='adjust' />
						</Menu.Item>
					</Menu.Menu>
				</Menu>

				<Modal open={loginDialogOpen} onClose={() => this._closeLoginDialog()} size='tiny'>
					<Modal.Header>Log-in to your account</Modal.Header>
					<Modal.Content>
						<Grid textAlign='center' verticalAlign='middle'>
							<Grid.Column style={{ maxWidth: 450 }}>
								<Form size='large' loading={loggingIn}>
									<Segment>
										<Form.Input
											fluid
											icon='user'
											iconPosition='left'
											placeholder='Username'
											value={user}
											onChange={(e, { value }) => this.setState({ user: value })}
										/>
										<Form.Input
											fluid
											icon='lock'
											iconPosition='left'
											placeholder='Password'
											type='password'
											value={password}
											onChange={(e, { value }) => this.setState({ password: value })}
										/>
									</Segment>
								</Form>
								{errorMessage && <Message error>{errorMessage}</Message>}
								{!errorMessage && (
									<Message>If you are an approved book editor, log in here to submit changes directly from the site.</Message>
								)}
							</Grid.Column>
						</Grid>
					</Modal.Content>
					<Modal.Actions>
						<Button content='Cancel' onClick={() => this._closeLoginDialog()} />
						<Button positive content='Login' onClick={() => this._doLogin()} />
					</Modal.Actions>
				</Modal>

				<Modal open={messageModalOpen} closeOnEscape={false} closeOnDimmerClick={false} onClose={() => this._closeMessageDialog()}>
					<Modal.Header>The DataCore website and bot have transitioned to a community ownership model!</Modal.Header>
					<Modal.Content>
						<p>We need your help! The project is <a href='https://github.com/stt-datacore'>open source</a> so we're open for contributions from software engineers, designers, devops, testers and so on. Reach out on our <a href='https://discord.gg/reFXRX'>development Discord</a> if you're not sure where to start.</p>
						<p>You can also contribute financially to support the cost of hosting our servers. Please consider <a href='https://www.patreon.com/Datacore'>becoming our patron!</a></p>
						<p>Please see this <a href='https://forum.disruptorbeam.com/stt/discussion/16539/datacore-current-status'>forum thread</a> for details and updates.</p>
					</Modal.Content>
					<Modal.Actions>
						<Button icon='checkmark' onClick={() => this._closeMessageDialog()} content='Ok' />
					</Modal.Actions>
				</Modal>
			</div>
		);
	}

	_doLogin() {
		const { user, password } = this.state;
		this.setState({ loggingIn: true });

		fetch(`${process.env.GATSBY_DATACORE_URL}api/login`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ user, password }),
		})
			.then((response) => response.json())
			.then((res) => {
				if (res.error || !res.token) {
					this.setState({ loggingIn: false, errorMessage: res.error });
				} else {
					// Logged in
					window.localStorage.setItem('token', res.token);
					window.localStorage.setItem('username', user);
					this.setState({ loggingIn: false, loginDialogOpen: false });
				}
			})
			.catch((err) => {
				this.setState({ loggingIn: false, errorMessage: err.toString() });
			});
	}

	_showLoginDialog(isLoggedIn: boolean) {
		if (isLoggedIn) {
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('username');
		} else {
			this.setState({ loginDialogOpen: true });
		}
	}

	_closeLoginDialog() {
		this.setState({ loginDialogOpen: false });
	}

	_closeMessageDialog() {
		this.setState({ messageModalOpen: false });
	}
}

export default TopMenu;
