import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'lehuuthanhdatrin0409@gmail.com',
    pass: 'hsks gfpb aezx qvnf',
  },
});