const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {createAccessToken,createRefreshToken}= require('../utils/tokenGenerator')
const {recoverPersonalSignature}= require('eth-sig-util')
const { bufferToHex } =require('ethereumjs-util') ;

const authCtrl = {
    register: async (req, res) => {
        try {
            const { fullname, username, email, password, gender } = req.body
            let newUserName = username.toLowerCase().replace(/ /g, '')

            const user_name = await Users.findOne({username: newUserName})
            if(user_name) return res.status(400).json({msg: "This user name already exists."})

            const user_email = await Users.findOne({email})
            if(user_email) return res.status(400).json({msg: "This email already exists."})

            if(password.length < 6)
            return res.status(400).json({msg: "Password must be at least 6 characters."})

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = new Users({
                fullname, username: newUserName, email, password: passwordHash, gender
            })


            const access_token = createAccessToken({id: newUser._id,walletAddress})
            const refresh_token = createRefreshToken({id: newUser._id,walletAddress})

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/api/refresh_token',
                maxAge: 30*24*60*60*1000 // 30days
            })

            await newUser.save()

            res.json({
                msg: 'Register Success!',
                access_token,
                user: {
                    ...newUser._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    login: async (req, res) => {

        const { signature, walletAddress } = req.body;
		if (!signature || !walletAddress)
			return res
				.status(400)
				.send({ error: 'Request should have signature and publicAddress' });
	
		return (
			Users.findOne({  walletAddress } )
				////////////////////////////////////////////////////
				// Step 1: Get the user with the given publicAddress
				////////////////////////////////////////////////////
				.then((user) => {
					if (!user) {
						res.status(401).send({
							error: `User with publicAddress ${publicAddress} is not found in database`,
						});
	
						return null;
					}
	
					return user;
				})
				////////////////////////////////////////////////////
				// Step 2: Verify digital signature
				////////////////////////////////////////////////////
				.then((user) => {
					if (!(user instanceof Users)) {
						// Should not happen, we should have already sent the response
						throw new Error(
							'User is not defined in "Verify digital signature".'
						);
					}
	
					const msg = `I am signing my one-time nonce: ${user.nonce}`;
	
					// We now are in possession of msg, publicAddress and signature. We
					// will use a helper from eth-sig-util to extract the address from the signature
					const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'));
					const address = recoverPersonalSignature({
						data: msgBufferHex,
						sig: signature,
					});
	
					// The signature verification is successful if the address found with
					// sigUtil.recoverPersonalSignature matches the initial publicAddress
					if (address.toLowerCase() === publicAddress.toLowerCase()) {
						return user;
					} else {
						res.status(401).send({
							error: 'Signature verification failed',
						});
	
						return null;
					}
				})
				////////////////////////////////////////////////////
				// Step 3: Generate a new nonce for the user
				////////////////////////////////////////////////////
				.then((user) => {
					if (!(user instanceof Users)) {
						// Should not happen, we should have already sent the response
	
						throw new Error(
							'User is not defined in "Generate a new nonce for the user".'
						);
					}
	
					user.nonce = Math.floor(Math.random() * 10000);
					return user.save();
				})
				////////////////////////////////////////////////////
				// Step 4: Create JWT
				////////////////////////////////////////////////////
				.then((user) => {

                    const access_token = createAccessToken({id: user._id,walletAddress})
                    const refresh_token = createRefreshToken({id: user._id,walletAddress})
        
                    res.cookie('refreshtoken', refresh_token, {
                        httpOnly: true,
                        path: '/api/refresh_token',
                        maxAge: 30*24*60*60*1000 // 30days
                    })
        
                    res.json({
                        msg: 'Login Success!',
                        access_token,
                        user: {
                            ...user._doc,
                            
                        }
                    })

					
					
				}).catch(error=>{
                    return res.status(500).json({msg: err.message})
                })
		);
       
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/api/refresh_token'})
            return res.json({msg: "Logged out!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    generateAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if(!rf_token) return res.status(400).json({msg: "Please login now."})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async(err, result) => {
                if(err) return res.status(400).json({msg: "Please login now."})

                const user = await Users.findById(result.walletAddress).populate('following')

                if(!user) return res.status(400).json({msg: "This does not exist."})

                const access_token = createAccessToken({id: result.id,walletAddress})

                res.json({
                    access_token,
                    user
                })
            })
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

module.exports = authCtrl