-- Aggregates real sales (excludes pending/cancelled orders, which aren't
-- confirmed purchases) per product, for the storefront's "Best Sellers"
-- section. SECURITY DEFINER because anon/authenticated callers only have
-- RLS access to their own orders — this needs to count across everyone's,
-- while only ever exposing a product_id + count, never raw order data.
create function public.get_best_seller_product_ids(p_threshold integer, p_limit integer)
returns table (product_id uuid, order_count bigint)
language sql
stable
security definer set search_path = public
as $$
  select oi.product_id, count(distinct oi.order_id) as order_count
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  join public.products p on p.id = oi.product_id
  where o.status in ('confirmed', 'shipped', 'delivered')
    and p.status = 'active'
  group by oi.product_id
  having count(distinct oi.order_id) > p_threshold
  order by order_count desc
  limit p_limit;
$$;

grant execute on function public.get_best_seller_product_ids to anon, authenticated;
