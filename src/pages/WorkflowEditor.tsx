import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkflowStore } from '../store/workflowStore';
import { Save, X, Plus } from 'lucide-react';

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addWorkflow = useWorkflowStore((state) => state.addWorkflow);
  const updateWorkflow = useWorkflowStore((state) => state.updateWorkflow);
  const getWorkflow = useWorkflowStore((state) => state.getWorkflow);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Preview mode notice
  const [showPreviewNotice] = useState(true);

  useEffect(() => {
    if (id) {
      const workflow = getWorkflow(id);
      if (workflow) {
        setName(workflow.name);
        setDescription(workflow.description);
        setTags(workflow.tags);
      }
    }
  }, [id, getWorkflow]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (id) {
      updateWorkflow(id, {
        name,
        description,
        tags,
      });
    } else {
      addWorkflow({
        name,
        description,
        status: 'draft',
        tasks: [],
        agents: [],
        tags,
      });
    }

    navigate('/workflows');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Workflow' : 'Create New Workflow'}
          </h1>
          <p className="text-gray-600 mt-1">
            Configure your agentic workflow settings
          </p>
        </div>
      </div>

      {showPreviewNotice && (
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <p className="text-sm text-black dark:text-white">
            <strong>Preview Mode:</strong> Changes are stored in browser localStorage only and will not persist. 
            Full backend persistence coming in production release.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label htmlFor="name" className="label">
            Workflow Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="e.g., Customer Research Pipeline"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows={4}
            placeholder="Describe what this workflow does..."
            required
          />
        </div>

        <div>
          <label className="label">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="input-field"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-secondary flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-primary-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/workflows')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{id ? 'Update Workflow' : 'Create Workflow'}</span>
          </button>
        </div>
      </form>

      <div className="card bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
        <h3 className="font-medium text-black dark:text-white mb-2">Next Steps</h3>
        <p className="text-sm text-gray-900 dark:text-gray-100">
          After creating your workflow, you can add agents and tasks from the workflow detail page.
          You can also start with a template from the Templates page.
        </p>
      </div>
    </div>
  );
}
