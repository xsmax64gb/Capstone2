import * as User from '../models/userModel.js'

export async function getAll(req, res, next) {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (err) {
    next(err)
  }
}
