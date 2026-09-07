import { useEffect, useState } from 'react';
import { BookOpen, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import { get, post, del, endpoints, getApiErrorMessage } from '../api';
import { currentRole } from '../auth';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, SelectField } from '../components/ui';

export default function KnowledgeResources() {
  const role = currentRole();
  const [resources, setResources] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    content: '',
    resourceType: 'ARTICLE',
    skillId: '',
  });

  async function load() {
    setLoading(true);
    try {
      const [resList, skillList] = await Promise.all([
        get(endpoints.resources),
        get(endpoints.skillMaster),
      ]);
      setResources(resList || []);
      setSkills(skillList || []);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Unable to load knowledge resources.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim() || !form.skillId) {
      setError('Please fill in the title, URL, and select a related skill.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await post(endpoints.resources, {
        title: form.title.trim(),
        description: form.description.trim(),
        url: form.url.trim(),
        content: form.content.trim(),
        resourceType: form.resourceType,
        skillId: Number(form.skillId),
      });
      setShowModal(false);
      setForm({
        title: '',
        description: '',
        url: '',
        content: '',
        resourceType: 'ARTICLE',
        skillId: '',
      });
      load();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to publish resource.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(resourceId: number) {
    if (!window.confirm('Are you sure you want to delete this knowledge resource?')) return;
    try {
      await del(`${endpoints.resources}/${resourceId}`);
      load();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to delete resource.'));
    }
  }

  const filtered = resources.filter((item) => {
    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.skillName?.toLowerCase().includes(search.toLowerCase()) ||
      item.authorName?.toLowerCase().includes(search.toLowerCase());

    const matchesSkill = !selectedSkill || String(item.skillId) === selectedSkill;
    const matchesType = !selectedType || item.resourceType === selectedType;

    return matchesSearch && matchesSkill && matchesType;
  });

  if (loading) return <Loading />;

  return (
    <>
      <div className="heroRow">
        <div>
          <p className="eyebrow">Enterprise Knowledge Repository</p>
          <h2>Knowledge Resources & Articles</h2>
          <p className="muted">
            Explore and share curated technical guides, whitepapers, best practices, and documentation mapped to competency skills.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: 6 }} /> Share Resource
        </Button>
      </div>

      {error && <ErrorBox message={error} />}

      <Card className="mb-4">
        <div className="formGrid" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
          <div className="field">
            <span>Search resources</span>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by title, author, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <SelectField
            label="Filter by Skill"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            <option value="">All Skills</option>
            {skills.map((s) => (
              <option key={s.skillId} value={s.skillId}>
                {s.skillName}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Filter by Type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="ARTICLE">Article</option>
            <option value="TUTORIAL">Tutorial</option>
            <option value="DOCUMENT">Documentation</option>
            <option value="VIDEO">Video</option>
            <option value="BOOK">Book</option>
            <option value="OTHER">Other</option>
          </SelectField>
        </div>
      </Card>

      <div className="cardGrid">
        {filtered.map((item) => (
          <Card key={item.resourceId} className="resourceCard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Badge tone="purple">{item.skillName || 'Skill'}</Badge>
              <Badge tone="green">{item.resourceType}</Badge>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h3>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
              {item.description || item.content || 'Curated technical reference material.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <small className="muted">By {item.authorName || 'Internal Expert'}</small>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Open <ExternalLink size={13} />
                  </a>
                )}

                {(role === 'ADMIN' || role === 'HR' || role === 'MANAGER') && (
                  <button
                    className="iconBtn"
                    title="Delete resource"
                    onClick={() => handleDelete(item.resourceId)}
                    style={{ color: '#bc2948', borderColor: '#f3c7d1' }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!filtered.length && <Empty text="No knowledge resources match the selected criteria." />}

      <Modal open={showModal} title="Share Knowledge Resource" onClose={() => setShowModal(false)}>
        <form onSubmit={handleCreate}>
          <Field
            label="Resource Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Best Practices for Spring Security 6"
            required
          />

          <div className="formGridAuth">
            <SelectField
              label="Related Skill *"
              value={form.skillId}
              onChange={(e) => setForm({ ...form, skillId: e.target.value })}
              required
            >
              <option value="">Select skill</option>
              {skills.map((s) => (
                <option key={s.skillId} value={s.skillId}>
                  {s.skillName}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Resource Type *"
              value={form.resourceType}
              onChange={(e) => setForm({ ...form, resourceType: e.target.value })}
            >
              <option value="ARTICLE">Article</option>
              <option value="TUTORIAL">Tutorial</option>
              <option value="DOCUMENT">Documentation</option>
              <option value="VIDEO">Video</option>
              <option value="BOOK">Book</option>
              <option value="OTHER">Other</option>
            </SelectField>
          </div>

          <Field
            label="URL / Link *"
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://docs.example.com/guide"
            required
          />

          <Field
            label="Short Summary / Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Briefly describe what readers will learn from this resource."
          />

          <div className="field">
            <span>Key Takeaways / Content Outline</span>
            <textarea
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Highlight key points or architectural patterns covered..."
              style={{
                width: '100%',
                borderRadius: 12,
                border: '1px solid var(--border)',
                background: '#f5f5f8',
                padding: '10px 14px',
                font: 'inherit',
                color: 'var(--text)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Publishing…' : 'Publish Resource'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
