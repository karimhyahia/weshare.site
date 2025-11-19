import { supabase } from './supabase';
import { CardData } from '../types';

export const sitesService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(site => ({
      ...JSON.parse(site.data),
      id: site.id
    })) as CardData[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      ...JSON.parse(data.data),
      id: data.id
    } as CardData;
  },

  async create(userId: string, siteData: CardData) {
    const { id, ...dataWithoutId } = siteData;

    const { data, error } = await supabase
      .from('sites')
      .insert({
        user_id: userId,
        internal_name: siteData.internalName,
        data: JSON.stringify(dataWithoutId),
        is_published: true
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...JSON.parse(data.data),
      id: data.id
    } as CardData;
  },

  async update(id: string, siteData: CardData) {
    const { id: _, ...dataWithoutId } = siteData;

    const { data, error } = await supabase
      .from('sites')
      .update({
        internal_name: siteData.internalName,
        data: JSON.stringify(dataWithoutId)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...JSON.parse(data.data),
      id: data.id
    } as CardData;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const contactsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*, sites(internal_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(contact => ({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      date: contact.created_at,
      source: (contact.sites as any)?.internal_name || 'Unknown'
    }));
  },

  async create(siteId: string, userId: string, contactData: { name: string; email: string; phone?: string; message?: string }) {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        site_id: siteId,
        user_id: userId,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        message: contactData.message
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const analyticsService = {
  async getForSite(siteId: string) {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('site_id', siteId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data;
  },

  async incrementViews(siteId: string, userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('analytics')
      .select('*')
      .eq('site_id', siteId)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('analytics')
        .update({ views: existing.views + 1 })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('analytics')
        .insert({
          site_id: siteId,
          user_id: userId,
          views: 1,
          clicks: 0,
          saves: 0,
          date: today
        });

      if (error) throw error;
    }
  },

  async incrementClicks(siteId: string, userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('analytics')
      .select('*')
      .eq('site_id', siteId)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('analytics')
        .update({ clicks: existing.clicks + 1 })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('analytics')
        .insert({
          site_id: siteId,
          user_id: userId,
          views: 0,
          clicks: 1,
          saves: 0,
          date: today
        });

      if (error) throw error;
    }
  }
};
