import { supabase } from "../config/supabaseClient.js";

export const BookModel = {
  async getAll() {
    const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase.from("books").select("*").eq("id", id).single();
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
    const { data, error } = await supabase.from("books").insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase.from("books").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data: refs, error: refError } = await supabase.from("loans").select("id").eq("book_id", id).limit(1);
    if (refError) throw refError;
    if (refs && refs.length > 0) throw new Error("Tidak dapat menghapus: buku ini masih memiliki data peminjaman.");
    await this.getById(id);
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) throw error;
    return { message: "Book deleted successfully" };
  },
};
