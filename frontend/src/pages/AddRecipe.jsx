import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { tagChipClasses } from '../utils/tagStyles';
import { createRecipe, getRecipeById, suggestTags, updateRecipe } from '../services/api';

const CURATED_TAGS = [
  'sweet',
  'savoury',
  'spicy',
  'vegetarian',
  'vegan',
  'seafood',
  'dessert',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

const emptyForm = {
  recipeName: '',
  country: '',
  state: '',
  author: '',
  ingredients: [''],
  instructions: [''],
  tags: [],
};

/** Generic list editor for ingredients/instructions: add, remove, edit each line. */
function ListEditor({ label, items, onChange, placeholder }) {
  const update = (i, value) => onChange(items.map((it, idx) => (idx === i ? value : it)));
  const add = () => onChange([...items, '']);
  const remove = (i) => onChange(items.length > 1 ? items.filter((_, idx) => idx !== i) : items);

  return (
    <div>
      <label className="text-sm font-semibold text-ink-600">{label}</label>
      <div className="mt-2 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-right font-mono text-xs text-ink-300">{i + 1}.</span>
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="input-field"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${label.toLowerCase()} line ${i + 1}`}
              className="shrink-0 rounded-lg p-2 text-ink-300 transition-colors hover:bg-chili-100 hover:text-chili-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 flex items-center gap-1 text-sm font-medium text-saffron-600 hover:text-saffron-700">
        <Plus className="h-4 w-4" aria-hidden="true" /> Add line
      </button>
    </div>
  );
}

export default function AddRecipe() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;
    getRecipeById(id)
      .then((res) => {
        const r = res.data;
        setForm({
          recipeName: r.recipeName,
          country: r.country,
          state: r.state,
          author: r.author || '',
          ingredients: r.ingredients.length ? r.ingredients : [''],
          instructions: r.instructions.length ? r.instructions : [''],
          tags: r.tags || [],
        });
        setExistingImageUrl(r.imageUrl || '');
        setLoading(false);
      })
      .catch(() => {
        setLoadError('Could not load this recipe for editing.');
        setLoading(false);
      });
  }, [id, isEditMode]);

  const handleField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase();
    if (!tag || form.tags.includes(tag)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
  };

  const removeTag = (tag) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  };

  const handleSuggestTags = async () => {
    const ingredients = form.ingredients.filter(Boolean);
    const instructions = form.instructions.filter(Boolean);
    if (!form.recipeName || ingredients.length === 0 || instructions.length === 0) {
      setFormError('Add a recipe name, ingredients, and instructions before suggesting tags.');
      return;
    }
    setFormError('');
    setSuggesting(true);
    try {
      const res = await suggestTags({ recipeName: form.recipeName, ingredients, instructions });
      setForm((f) => ({ ...f, tags: [...new Set([...f.tags, ...res.data])] }));
    } catch {
      setFormError('Claude could not suggest tags right now. You can add your own instead.');
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const ingredients = form.ingredients.map((i) => i.trim()).filter(Boolean);
    const instructions = form.instructions.map((i) => i.trim()).filter(Boolean);

    if (!form.recipeName.trim() || !form.country.trim() || !form.state.trim()) {
      setFormError('Recipe name, country, and state/region are required.');
      return;
    }
    if (ingredients.length === 0 || instructions.length === 0) {
      setFormError('Add at least one ingredient and one instruction step.');
      return;
    }

    const data = new FormData();
    data.append('recipeName', form.recipeName.trim());
    data.append('country', form.country.trim());
    data.append('state', form.state.trim());
    if (form.author.trim()) data.append('author', form.author.trim());
    data.append('ingredients', JSON.stringify(ingredients));
    data.append('instructions', JSON.stringify(instructions));
    data.append('tags', JSON.stringify(form.tags));
    if (imageFile) data.append('image', imageFile);

    setSubmitting(true);
    try {
      const res = isEditMode ? await updateRecipe(id, data) : await createRecipe(data);
      navigate(`/recipes/${res.data._id}`);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save this recipe. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="px-6 py-16 text-center text-ink-300">Loading recipe…</p>;
  }
  if (loadError) {
    return <p className="px-6 py-16 text-center text-chili-600">{loadError}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl">{isEditMode ? 'Edit recipe' : 'Add a recipe to the atlas'}</h1>
      <p className="mt-1 text-ink-300">
        {isEditMode
          ? 'Update the details below.'
          : "Fill in the details below. Leave tags blank and Claude will suggest some for you."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="recipeName" className="text-sm font-semibold text-ink-600">
              Recipe name
            </label>
            <input
              id="recipeName"
              value={form.recipeName}
              onChange={handleField('recipeName')}
              placeholder="e.g. Kerala Fish Curry"
              className="input-field mt-2"
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="text-sm font-semibold text-ink-600">
              Country
            </label>
            <input
              id="country"
              value={form.country}
              onChange={handleField('country')}
              placeholder="e.g. India"
              className="input-field mt-2"
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="text-sm font-semibold text-ink-600">
              State / Region
            </label>
            <input
              id="state"
              value={form.state}
              onChange={handleField('state')}
              placeholder="e.g. Kerala"
              className="input-field mt-2"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="author" className="text-sm font-semibold text-ink-600">
              Your name <span className="font-normal text-ink-300">(optional)</span>
            </label>
            <input
              id="author"
              value={form.author}
              onChange={handleField('author')}
              placeholder="e.g. Lakshmi Menon"
              className="input-field mt-2"
            />
          </div>
        </div>

        <ListEditor
          label="Ingredients"
          items={form.ingredients}
          onChange={(ingredients) => setForm((f) => ({ ...f, ingredients }))}
          placeholder="e.g. 2 cups basmati rice"
        />

        <ListEditor
          label="Cooking instructions"
          items={form.instructions}
          onChange={(instructions) => setForm((f) => ({ ...f, instructions }))}
          placeholder="e.g. Soak the rice for 20 minutes"
        />

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ink-600">
              Tags <span className="font-normal text-ink-300">(optional)</span>
            </label>
            <button
              type="button"
              onClick={handleSuggestTags}
              disabled={suggesting}
              className="flex items-center gap-1.5 text-sm font-medium text-saffron-600 hover:text-saffron-700 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {suggesting ? 'Asking Claude…' : 'Suggest tags with AI'}
            </button>
          </div>

          {form.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span key={tag} className={`tag-chip border ${tagChipClasses(tag, true)}`}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter"
            className="input-field mt-3"
          />

          <div className="mt-2 flex flex-wrap gap-1.5">
            {CURATED_TAGS.filter((t) => !form.tags.includes(t)).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className={`tag-chip border ${tagChipClasses(t)}`}
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink-600">
            Recipe image <span className="font-normal text-ink-300">(optional)</span>
          </label>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink-200 bg-parchment-300">
              {imagePreview || existingImageUrl ? (
                <img src={imagePreview || existingImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-ink-200" aria-hidden="true" />
              )}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary">
              Choose photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {formError && <p className="rounded-lg bg-chili-100 px-4 py-3 text-sm text-chili-600">{formError}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-accent">
            {submitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Publish recipe'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
