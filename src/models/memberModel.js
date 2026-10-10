import { supabase } from "../config/supabaseClient.js";

export const MemberModel = {
  async getAll() {
    const { data, error } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase.from("members").select("*").eq("id", id).single();
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
    const { data, error } = await supabase.from("members").insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase.from("members").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { data: refs, error: refError } = await supabase.from("loans").select("id").eq("member_id", id).limit(1);
    if (refError) throw refError;
    if (refs && refs.length > 0) throw new Error("Tidak dapat menghapus: anggota ini masih memiliki data peminjaman.");
    await this.getById(id);
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) throw error;
    return { message: "Member deleted successfully" };
  },
};
