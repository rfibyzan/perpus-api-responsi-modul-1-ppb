import { supabase } from "../config/supabaseClient.js";

const LOAN_DETAIL_SELECT = `
  id, book_id, member_id, tanggal_pinjam, tanggal_kembali, tanggal_jatuh_tempo, status, created_at,
  books ( id, judul, penulis ),
  members ( id, nama, email )
`;

export const LoanModel = {
  async getAll(filters = {}) {
    const columns = "id, book_id, member_id, tanggal_pinjam, tanggal_kembali, tanggal_jatuh_tempo, status, created_at";

    // Filter Terlambat ikut sertakan pinjaman Dipinjam yang lewat tanggal jatuh tempo.
    if (filters.status === "Terlambat") {
      const today = new Date().toISOString().slice(0, 10);
      let q1 = supabase.from("loans").select(columns).eq("status", "Terlambat").order("created_at", { ascending: false });
      let q2 = supabase.from("loans").select(columns).eq("status", "Dipinjam").lt("tanggal_jatuh_tempo", today).order("created_at", { ascending: false });
      if (filters.member_id) {
        q1 = q1.eq("member_id", filters.member_id);
        q2 = q2.eq("member_id", filters.member_id);
      }
      if (filters.book_id) {
        q1 = q1.eq("book_id", filters.book_id);
        q2 = q2.eq("book_id", filters.book_id);
      }
      const [{ data: late, error: lateError }, { data: overdue, error: overdueError }] = await Promise.all([q1, q2]);
      if (lateError) throw lateError;
      if (overdueError) throw overdueError;
      return [...(late || []), ...(overdue || [])];
    }

    let query = supabase.from("loans").select(columns).order("created_at", { ascending: false });

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.member_id) query = query.eq("member_id", filters.member_id);
    if (filters.book_id) query = query.eq("book_id", filters.book_id);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase.from("loans").select(LOAN_DETAIL_SELECT).eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") {
        const notFound = new Error("Data tidak ditemukan");
        notFound.code = "NOT_FOUND";
        throw notFound;
      }
      throw error;
    }
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase.from("loans").insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase.from("loans").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    await this.getById(id);
    const { error } = await supabase.from("loans").delete().eq("id", id);
    if (error) throw error;
    return { message: "Loan deleted successfully" };
  },
};
