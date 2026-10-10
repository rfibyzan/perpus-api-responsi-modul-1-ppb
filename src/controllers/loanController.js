import { LoanModel } from "../models/loanModel.js";

const ALLOWED_STATUS = ["Dipinjam", "Dikembalikan", "Terlambat"];

export const LoanController = {
  async getAll(req, res) {
    try {
      const { status, member_id, book_id } = req.query;
      if (status && !ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ error: `status harus salah satu dari: ${ALLOWED_STATUS.join(", ")}` });
      }
      const loans = await LoanModel.getAll({ status, member_id, book_id });
      res.json(loans);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const loan = await LoanModel.getById(req.params.id);
      res.json(loan);
    } catch (err) {
      if (err.code === "NOT_FOUND") return res.status(404).json({ error: err.message });
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { book_id, member_id, status } = req.body;
      if (!book_id || !member_id) {
        return res.status(400).json({ error: "book_id dan member_id wajib diisi" });
      }
      if (status && !ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ error: `status harus salah satu dari: ${ALLOWED_STATUS.join(", ")}` });
      }
      const loan = await LoanModel.create(req.body);
      res.status(201).json(loan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      if (req.body.status && !ALLOWED_STATUS.includes(req.body.status)) {
        return res.status(400).json({ error: `status harus salah satu dari: ${ALLOWED_STATUS.join(", ")}` });
      }
      const loan = await LoanModel.update(req.params.id, req.body);
      res.json(loan);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await LoanModel.remove(req.params.id);
      res.json({ message: "Loan deleted successfully" });
    } catch (err) {
      if (err.code === "NOT_FOUND") return res.status(404).json({ error: err.message });
      res.status(400).json({ error: err.message });
    }
  },
};
