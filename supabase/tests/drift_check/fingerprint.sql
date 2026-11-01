-- Schema fingerprint for public + private. Run the SAME text on the live project
-- (Supabase SQL editor or MCP execute_sql) and on a local replay; every row must match.
-- MAINTAIN (PG17-only) is ignored; ACLs are limited to anon/authenticated/service_role/PUBLIC;
-- ordering is pinned to the C collation so PG16 and PG17 hash identically.
with s as (select oid, nspname from pg_namespace where nspname in ('public','private')),
items as (
  select 'rel' k, s.nspname||'.'||c.relname||' kind='||c.relkind::text||' rls='||c.relrowsecurity||' force='||c.relforcerowsecurity||' acl='||coalesce((select string_agg(coalesce(nullif(e.grantee::regrole::text,'-'),'PUBLIC')||':'||e.privilege_type, ',' order by coalesce(nullif(e.grantee::regrole::text,'-'),'PUBLIC')||':'||e.privilege_type collate "C") from aclexplode(c.relacl) e where e.privilege_type<>'MAINTAIN' and (e.grantee=0 or e.grantee::regrole::text in ('anon','authenticated','service_role'))),'-') v
    from pg_class c join s on s.oid=c.relnamespace where c.relkind in ('r','v','m','S','p')
  union all
  select 'col', s.nspname||'.'||c.relname||'.'||a.attname||' '||format_type(a.atttypid,a.atttypmod)||' nn='||a.attnotnull||' def='||coalesce(pg_get_expr(d.adbin,d.adrelid),'-')||' id='||a.attidentity::text||' gen='||a.attgenerated::text||' acl='||coalesce((select string_agg(coalesce(nullif(e.grantee::regrole::text,'-'),'PUBLIC')||':'||e.privilege_type, ',' order by coalesce(nullif(e.grantee::regrole::text,'-'),'PUBLIC')||':'||e.privilege_type collate "C") from aclexplode(a.attacl) e where e.privilege_type<>'MAINTAIN' and (e.grantee=0 or e.grantee::regrole::text in ('anon','authenticated','service_role'))),'-')
    from pg_attribute a join pg_class c on c.oid=a.attrelid join s on s.oid=c.relnamespace
    left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
    where c.relkind in ('r','v','p') and a.attnum>0 and not a.attisdropped
  union all
  select 'con', s.nspname||'.'||c.relname||'.'||co.conname||' '||pg_get_constraintdef(co.oid)
    from pg_constraint co join pg_class c on c.oid=co.conrelid join s on s.oid=c.relnamespace
  union all
  select 'idx', s.nspname||'.'||i.relname||' '||pg_get_indexdef(i.oid)
    from pg_index x join pg_class i on i.oid=x.indexrelid join s on s.oid=i.relnamespace
  union all
  select 'pol', p.schemaname||'.'||p.tablename||'.'||p.policyname||' '||p.permissive||' '||p.cmd||' '||p.roles::text||' using='||coalesce(p.qual,'-')||' check='||coalesce(p.with_check,'-')
    from pg_policies p where p.schemaname in ('public','private')
  union all
  select 'fn', s.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||') ret='||pg_get_function_result(p.oid)||' lang='||l.lanname||' secdef='||p.prosecdef||' vol='||p.provolatile::text||' cfg='||coalesce(p.proconfig::text,'-')||' acl='||coalesce((select string_agg(coalesce(nullif(e.grantee::regrole::text,'-'),'PUBLIC')||':'||e.privilege_type, ',' order by coalesce(nullif(e.grantee::regrole::text,'-'),'PUBLIC')||':'||e.privilege_type collate "C") from aclexplode(p.proacl) e where e.privilege_type<>'MAINTAIN' and (e.grantee=0 or e.grantee::regrole::text in ('anon','authenticated','service_role'))),'-')||' src='||md5(regexp_replace(p.prosrc,'\s+',' ','g'))
    from pg_proc p join s on s.oid=p.pronamespace join pg_language l on l.oid=p.prolang
  union all
  select 'trg', s.nspname||'.'||c.relname||'.'||t.tgname||' '||pg_get_triggerdef(t.oid)
    from pg_trigger t join pg_class c on c.oid=t.tgrelid join s on s.oid=c.relnamespace where not t.tgisinternal
  union all
  select 'view', s.nspname||'.'||c.relname||' '||md5(regexp_replace(pg_get_viewdef(c.oid),'\s+',' ','g'))||' opts='||coalesce(c.reloptions::text,'-')
    from pg_class c join s on s.oid=c.relnamespace where c.relkind in ('v','m')
  union all
  select 'nsp', n.nspname||' acl='||coalesce((select string_agg(coalesce(nullif(e.grantee::regrole::text,'-'),'PUBLIC')||':'||e.privilege_type, ',' order by coalesce(nullif(e.grantee::regrole::text,'-'),'PUBLIC')||':'||e.privilege_type collate "C") from aclexplode(n.nspacl) e where e.privilege_type<>'MAINTAIN' and (e.grantee=0 or e.grantee::regrole::text in ('anon','authenticated','service_role'))),'-') from pg_namespace n where n.nspname in ('public','private')
)
select k, count(*) n, md5(string_agg(regexp_replace(v,'\s+',' ','g'), E'\n' order by regexp_replace(v,'\s+',' ','g') collate "C")) h from items group by k order by k;
